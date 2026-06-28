/* RSVP form → Google Apps Script Web App (or graceful fallback).
   La lista de nombres + cupo máximo se lee en vivo de la pestaña "invitados". */
(function () {
  var cfg = window.WEDDING_CONFIG || {};

  var modal = document.getElementById("rsvp-modal");
  var form = document.getElementById("rsvp-form");
  var body = document.getElementById("rsvp-body");
  var success = document.getElementById("rsvp-success");
  var submitBtn = document.getElementById("rsvp-submit");
  var deadline = document.getElementById("rsvp-deadline");
  if (!modal || !form) return;

  var nameSelect = document.getElementById("rsvp-nombre");
  var nameFallback = document.getElementById("rsvp-nombre-fallback");
  var invField = document.getElementById("rsvp-invitados-field");
  var invInput = document.getElementById("rsvp-invitados");

  if (deadline && cfg.rsvpDeadlineText) {
    deadline.textContent = "Por favor confirma antes del " + cfg.rsvpDeadlineText + ".";
  }

  var seq = 0;

  /* ---------- Carga de invitados (nombre + cupos) vía JSONP ---------- */
  var cuposByName = {};   // { "Nombre": cupos }
  var namesReady = false; // lista cargada con éxito
  var loading = false;    // petición en curso

  function fillNames(list) {
    cuposByName = {};
    nameSelect.innerHTML = "";
    var ph = document.createElement("option");
    ph.value = ""; ph.textContent = "Selecciona tu nombre";
    nameSelect.appendChild(ph);
    list.forEach(function (it) {
      var name = String(it.name || "").trim();
      if (!name) return;
      var cupos = parseInt(it.cupos, 10);
      if (isNaN(cupos) || cupos < 1) cupos = 1;
      cuposByName[name] = cupos;
      var o = document.createElement("option");
      o.value = name; o.textContent = name;
      o.setAttribute("data-cupos", cupos);
      nameSelect.appendChild(o);
    });
    namesReady = true;
    loading = false;
    nameSelect.hidden = false; nameSelect.disabled = false;
    nameFallback.hidden = true;
    refreshGuestField();
  }

  // Respaldo: si no hay endpoint o la carga falla, usamos un input de texto libre.
  function useFallbackName() {
    loading = false;
    nameSelect.hidden = true; nameSelect.disabled = true;
    nameFallback.hidden = false;
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

  /* ---------- Estado del formulario ---------- */
  function getNombre() {
    if (!nameFallback.hidden) return nameFallback.value.trim();
    return (nameSelect.value || "").trim();
  }

  function attendingNow() {
    var r = form.querySelector('input[name="asiste"]:checked');
    return !r || r.value === "Sí, asistiré";
  }

  // Máximo de invitados para el nombre elegido (null = aún sin nombre).
  function currentMax() {
    if (!nameFallback.hidden) return 10;            // texto libre: tope prudente
    var n = nameSelect.value;
    if (n && cuposByName.hasOwnProperty(n)) return cuposByName[n];
    return null;
  }

  // Muestra/oculta y acota el campo "Número de invitados" según asistencia y cupos.
  function refreshGuestField() {
    if (!attendingNow()) {
      invField.hidden = true;
      invInput.value = "0";
      return;
    }
    invField.hidden = false;
    invInput.min = "1";
    var max = currentMax();
    if (max == null) {
      invInput.max = "10";
      invInput.disabled = false;
      return;
    }
    invInput.max = String(max);
    invInput.disabled = (max <= 1);
    var v = parseInt(invInput.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > max) v = max;
    invInput.value = String(v);
  }

  nameSelect.addEventListener("change", refreshGuestField);
  nameFallback.addEventListener("input", refreshGuestField);
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
    var nombre = getNombre();
    var asiste = form.asiste.value;
    var mensaje = form.mensaje.value.trim();
    if (!nombre) {
      (nameFallback.hidden ? nameSelect : nameFallback).focus();
      return;
    }

    var attending = asiste === "Sí, asistiré";
    var invitados = attending ? (invInput.value || "1") : "0";

    // Registra la confirmación en la hoja (si hay endpoint), además de WhatsApp.
    logToSheet({ nombre: nombre, asiste: asiste, invitados: invitados, mensaje: mensaje });

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
  });
})();
