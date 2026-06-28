/* RSVP form → Google Apps Script Web App (or graceful fallback). */
(function () {
  var cfg = window.WEDDING_CONFIG || {};

  var modal = document.getElementById("rsvp-modal");
  var form = document.getElementById("rsvp-form");
  var body = document.getElementById("rsvp-body");
  var success = document.getElementById("rsvp-success");
  var submitBtn = document.getElementById("rsvp-submit");
  var deadline = document.getElementById("rsvp-deadline");
  if (!modal || !form) return;

  if (deadline && cfg.rsvpDeadlineText) {
    deadline.textContent = "Por favor confirma antes del " + cfg.rsvpDeadlineText + ".";
  }

  // Registro silencioso en la hoja (mismo Web App que los regalos), vía JSONP.
  var seq = 0;
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

  function open() {
    body.hidden = false; success.hidden = true;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
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
    var nombre = form.nombre.value.trim();
    var asiste = form.asiste.value;
    var invitados = form.invitados.value;
    var mensaje = form.mensaje.value.trim();
    if (!nombre) { form.nombre.focus(); return; }

    var attending = asiste === "Sí, asistiré";

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
