/* RSVP form → Google Apps Script Web App (or graceful fallback).
   La lista de nombres + cupo máximo se lee en vivo de la pestaña "invitados".
   El nombre se elige con un buscador (combobox); al confirmar, el nombre se
   marca en la hoja y desaparece de la lista. */
(function () {
  var cfg = window.WEDDING_CONFIG || {};

  var modal = document.getElementById("rsvp-modal");
  var form = document.getElementById("rsvp-form");
  var body = document.getElementById("rsvp-body");
  var success = document.getElementById("rsvp-success");
  var deadline = document.getElementById("rsvp-deadline");
  if (!modal || !form) return;

  var combo = document.getElementById("rsvp-combo");
  var nameInput = document.getElementById("rsvp-nombre");
  var nameList = document.getElementById("rsvp-name-list");
  var invField = document.getElementById("rsvp-invitados-field");
  var invInput = document.getElementById("rsvp-invitados");

  if (deadline && cfg.rsvpDeadlineText) {
    deadline.textContent = "Por favor confirma antes del " + cfg.rsvpDeadlineText + ".";
  }

  var seq = 0;

  /* ---------- Estado de la lista de invitados ---------- */
  var items = [];          // [{ name, cupos }] aún disponibles
  var cuposByName = {};     // { "Nombre": cupos }
  var namesReady = false;   // lista cargada con éxito
  var loading = false;      // petición en curso
  var activeIdx = -1;       // opción resaltada con teclado

  function norm(s) { return String(s || "").trim().toLowerCase(); }

  function indexItems() {
    cuposByName = {};
    items.forEach(function (it) { cuposByName[it.name] = it.cupos; });
  }

  function fillNames(list) {
    items = list.map(function (it) {
      var cupos = parseInt(it.cupos, 10);
      return { name: String(it.name || "").trim(), cupos: (isNaN(cupos) || cupos < 1) ? 1 : cupos };
    }).filter(function (it) { return it.name; });
    indexItems();
    namesReady = true; loading = false;
    nameInput.placeholder = "Escribe o elige tu nombre";
    refreshGuestField();
  }

  // Respaldo: si no hay endpoint o la carga falla, el campo es texto libre.
  function useFallbackName() {
    loading = false; namesReady = false;
    nameInput.placeholder = "Tu nombre y apellido";
    closeList();
    refreshGuestField();
  }

  function loadInvitados() {
    if (namesReady || loading) return;
    if (!cfg.giftEndpoint) { useFallbackName(); return; }
    loading = true;
    var cbName = "__invcb_" + (++seq);
    var s = document.createElement("script");
    var done = false;
    function cleanup() {
      try { delete window[cbName]; } catch (e) {}
      if (s.parentNode) s.parentNode.removeChild(s);
    }
    window[cbName] = function (resp) {
      done = true; cleanup();
      if (resp && resp.ok && resp.invitados && resp.invitados.length) fillNames(resp.invitados);
      else useFallbackName();
    };
    s.onerror = function () { done = true; cleanup(); useFallbackName(); };
    s.src = cfg.giftEndpoint + (cfg.giftEndpoint.indexOf("?") < 0 ? "?" : "&") +
      "action=invitados&callback=" + cbName;
    document.body.appendChild(s);
    setTimeout(function () { if (!done) { cleanup(); useFallbackName(); } }, 8000);
  }

  /* ---------- Combobox (buscador de nombres) ---------- */
  function matches(q) {
    q = norm(q);
    if (!q) return items.slice(0, 50);
    return items.filter(function (it) { return norm(it.name).indexOf(q) >= 0; }).slice(0, 50);
  }

  function openList() { nameList.hidden = false; nameInput.setAttribute("aria-expanded", "true"); }
  function closeList() { nameList.hidden = true; nameInput.setAttribute("aria-expanded", "false"); activeIdx = -1; }

  function renderList() {
    if (!namesReady) { closeList(); return; }     // modo texto libre: sin lista
    var list = matches(nameInput.value);
    nameList.innerHTML = "";
    if (!list.length) {
      var li = document.createElement("li");
      li.className = "empty"; li.textContent = "Sin resultados";
      nameList.appendChild(li);
      openList(); activeIdx = -1; return;
    }
    list.forEach(function (it, i) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.textContent = it.name;
      li.dataset.name = it.name;
      li.addEventListener("mousedown", function (e) { e.preventDefault(); choose(it.name); });
      nameList.appendChild(li);
    });
    activeIdx = -1;
    openList();
  }

  function highlight(idx) {
    var opts = nameList.querySelectorAll('li[role="option"]');
    if (!opts.length) return;
    if (idx < 0) idx = opts.length - 1;
    if (idx >= opts.length) idx = 0;
    activeIdx = idx;
    for (var i = 0; i < opts.length; i++) {
      var on = i === activeIdx;
      opts[i].classList.toggle("active", on);
      opts[i].setAttribute("aria-selected", on ? "true" : "false");
      if (on) opts[i].scrollIntoView({ block: "nearest" });
    }
  }

  function choose(name) {
    nameInput.value = name;
    closeList();
    refreshGuestField();
  }

  // Nombre conocido (disponible) que coincide exactamente, sin distinguir mayúsculas.
  function matchedName() {
    var v = norm(nameInput.value);
    for (var i = 0; i < items.length; i++) if (norm(items[i].name) === v) return items[i].name;
    return null;
  }

  nameInput.addEventListener("focus", function () { if (namesReady) renderList(); });
  nameInput.addEventListener("input", function () { renderList(); refreshGuestField(); });
  nameInput.addEventListener("keydown", function (e) {
    if (!namesReady) return;
    if (e.key === "ArrowDown") { if (nameList.hidden) renderList(); else highlight(activeIdx + 1); e.preventDefault(); }
    else if (e.key === "ArrowUp") { if (!nameList.hidden) { highlight(activeIdx - 1); e.preventDefault(); } }
    else if (e.key === "Enter") {
      var opts = nameList.querySelectorAll('li[role="option"]');
      if (!nameList.hidden && activeIdx >= 0 && opts[activeIdx]) { choose(opts[activeIdx].dataset.name); e.preventDefault(); }
    } else if (e.key === "Escape") { closeList(); }
  });
  // Cierra la lista al hacer clic fuera del combobox.
  document.addEventListener("click", function (e) { if (combo && !combo.contains(e.target)) closeList(); });

  /* ---------- Campo "Número de invitados" ---------- */
  function attendingNow() {
    var r = form.querySelector('input[name="asiste"]:checked');
    return !r || r.value === "Sí, asistiré";
  }

  // Máximo para el nombre elegido (null = aún sin nombre válido; 10 en texto libre).
  function currentMax() {
    if (!namesReady) return 10;
    var n = matchedName();
    return n ? cuposByName[n] : null;
  }

  function clampGuests(max) {
    var v = parseInt(invInput.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > max) v = max;
    invInput.value = String(v);
  }

  function refreshGuestField() {
    if (!attendingNow()) {
      invField.hidden = true;
      invInput.value = "0";
      return;
    }
    invField.hidden = false;
    invInput.min = "1";
    var max = currentMax();
    if (max == null) { invInput.max = "10"; invInput.disabled = false; return; }
    invInput.max = String(max);
    invInput.disabled = (max <= 1);
    clampGuests(max);
  }

  // Tope duro: aunque escriban un número directo, nunca supera el cupo.
  invInput.addEventListener("input", function () {
    if (invInput.hidden || !attendingNow()) return;
    var max = currentMax();
    if (max != null && invInput.value !== "") clampGuests(max);
  });

  Array.prototype.forEach.call(form.querySelectorAll('input[name="asiste"]'), function (r) {
    r.addEventListener("change", refreshGuestField);
  });

  /* ---------- Registro silencioso en la hoja (acción rsvp) vía JSONP ---------- */
  function logToSheet(data) {
    if (!cfg.giftEndpoint) return;
    var name = "__rsvpcb_" + (++seq);
    var s = document.createElement("script");
    window[name] = function () { cleanup(); };
    s.onerror = function () { cleanup(); };
    function cleanup() { try { delete window[name]; } catch (e) {} if (s.parentNode) s.parentNode.removeChild(s); }
    data.action = "rsvp"; data.callback = name;
    var q = [];
    for (var k in data) { if (data.hasOwnProperty(k)) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(data[k])); }
    s.src = cfg.giftEndpoint + (cfg.giftEndpoint.indexOf("?") < 0 ? "?" : "&") + q.join("&");
    document.body.appendChild(s);
  }

  // Quita un nombre de la lista local (tras confirmar) para que desaparezca al instante.
  function removeNameLocally(name) {
    var k = norm(name);
    items = items.filter(function (it) { return norm(it.name) !== k; });
    indexItems();
  }

  /* ---------- Modal ---------- */
  function open() {
    body.hidden = false; success.hidden = true;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    loadInvitados();
    refreshGuestField();
    var c = document.getElementById("rsvp-close"); if (c) c.focus();
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  // expose for main.js (button + tap handling)
  window.RSVP = { open: open, close: close, isOpen: function () { return modal.classList.contains("open"); } };

  document.getElementById("rsvp-close").addEventListener("click", close);
  document.getElementById("rsvp-done").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = nameInput.value.trim();
    var asiste = form.asiste.value;
    var mensaje = form.mensaje.value.trim();

    if (!nombre) { nameInput.focus(); return; }
    // Con lista cargada, el nombre debe ser uno de la lista.
    if (namesReady && !matchedName()) {
      nameInput.focus();
      if (combo) combo.classList.add("err");
      renderList();
      return;
    }
    if (combo) combo.classList.remove("err");

    var attending = asiste === "Sí, asistiré";
    var invitados = attending ? (invInput.value || "1") : "0";

    // Registra la confirmación en la hoja (si hay endpoint), además de WhatsApp.
    logToSheet({ nombre: nombre, asiste: asiste, invitados: invitados, mensaje: mensaje });
    // Desaparece de la lista local de inmediato (el server lo mantiene fuera al recargar).
    if (namesReady) removeNameLocally(nombre);

    // Arma el mensaje de WhatsApp ya redactado (distinto según asista o no)
    var lines;
    if (attending) {
      lines = [
        "¡Hola Jamil & Gabriela! 💍",
        "",
        "Confirmo mi asistencia a su boda:",
        "• Nombre: " + nombre,
        "• Asistencia: " + asiste,
        "• N° de invitados: " + invitados,
      ];
    } else {
      lines = [
        "¡Hola Jamil & Gabriela! 💛",
        "",
        "Lamentablemente no podré acompañarlos en su boda.",
        "• Nombre: " + nombre,
      ];
    }
    if (mensaje) lines.push("• Mensaje: " + mensaje);
    var text = encodeURIComponent(lines.join("\n"));

    var num = (cfg.whatsappNumber || "").replace(/[^0-9]/g, "");
    var url = num
      ? "https://wa.me/" + num + "?text=" + text
      : "https://wa.me/?text=" + text;

    // Ajusta la pantalla de confirmación al tipo de respuesta
    var icon = document.getElementById("rsvp-success-icon");
    var title = document.getElementById("rsvp-success-title");
    var sText = document.getElementById("rsvp-success-text");
    if (attending) {
      if (icon) { icon.textContent = "♥"; icon.classList.remove("is-regret"); }
      if (title) title.textContent = "¡Gracias!";
      if (sText) sText.innerHTML = "Se abrió WhatsApp con tu confirmación.<br/>Solo presiona enviar. ¡Nos vemos el 01 de agosto! 💛";
    } else {
      if (icon) { icon.textContent = "✉"; icon.classList.add("is-regret"); }
      if (title) title.textContent = "¡Gracias por avisarnos!";
      if (sText) sText.innerHTML = "Sentimos que no puedas acompañarnos.<br/>Los vamos a extrañar 💛";
    }

    // Abre WhatsApp y muestra la confirmación visual
    window.open(url, "_blank", "noopener");
    body.hidden = true;
    success.hidden = false;
    form.reset();
    closeList();
  });
})();
