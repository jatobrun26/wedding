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

  function open() {
    body.hidden = false; success.hidden = true;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
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

    // Arma el mensaje de WhatsApp ya redactado
    var lines = [
      "¡Hola Jamil & Gabriela! 💍",
      "",
      "Confirmo mi asistencia a su boda:",
      "• Nombre: " + nombre,
      "• Asistencia: " + asiste,
      "• N° de invitados: " + invitados,
    ];
    if (mensaje) lines.push("• Mensaje: " + mensaje);
    var text = encodeURIComponent(lines.join("\n"));

    var num = (cfg.whatsappNumber || "").replace(/[^0-9]/g, "");
    var url = num
      ? "https://wa.me/" + num + "?text=" + text
      : "https://wa.me/?text=" + text;

    // Abre WhatsApp y muestra la confirmación visual
    window.open(url, "_blank", "noopener");
    body.hidden = true;
    success.hidden = false;
    form.reset();
  });
})();
