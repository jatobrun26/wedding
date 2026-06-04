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
    var data = {
      nombre: form.nombre.value.trim(),
      asiste: form.asiste.value,
      invitados: form.invitados.value,
      mensaje: form.mensaje.value.trim(),
      fecha_envio: new Date().toISOString(),
    };
    if (!data.nombre) { form.nombre.focus(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    function done() {
      body.hidden = true; success.hidden = false;
      submitBtn.disabled = false; submitBtn.textContent = "Enviar confirmación";
      form.reset();
    }

    if (cfg.rsvpEndpoint) {
      // Apps Script Web Apps don't send CORS headers; use a "simple" request
      // (URL-encoded body, no custom headers) + no-cors and assume success.
      var params = new URLSearchParams(data);
      fetch(cfg.rsvpEndpoint, { method: "POST", mode: "no-cors", body: params })
        .then(done)
        .catch(function () {
          alert("No pudimos enviar la confirmación. Revisa tu conexión e inténtalo de nuevo.");
          submitBtn.disabled = false; submitBtn.textContent = "Enviar confirmación";
        });
    } else {
      // No endpoint configured yet — log locally and confirm visually so the
      // experience still works during development.
      console.warn("[RSVP] Sin rsvpEndpoint configurado. Datos:", data);
      setTimeout(done, 500);
    }
  });
})();
