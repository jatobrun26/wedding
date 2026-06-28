/* Lista de regalos con reservas → Google Apps Script Web App (vía JSONP).
   Lee la lista disponible y reserva los regalos elegidos por cada familia.
   Usa JSONP (parámetro ?callback=) para evitar problemas de CORS con Apps Script. */
(function () {
  "use strict";
  var cfg = window.WEDDING_CONFIG || {};
  var endpoint = cfg.giftEndpoint || "";

  var modal = document.getElementById("gift-modal");
  if (!modal) return;

  var body = document.getElementById("gift-body");
  var success = document.getElementById("gift-success");
  var successMsg = document.getElementById("gift-success-msg");
  var listBox = document.getElementById("gift-list");
  var familiaInput = document.getElementById("gift-familia");
  var submitBtn = document.getElementById("gift-submit");

  var seq = 0;

  /* ---------- JSONP ---------- */
  function jsonp(params, done) {
    if (!endpoint) { done(new Error("sin endpoint")); return; }
    var name = "__giftcb_" + (++seq);
    var script = document.createElement("script");
    var timer = setTimeout(function () { cleanup(); done(new Error("timeout")); }, 15000);
    function cleanup() {
      clearTimeout(timer);
      try { delete window[name]; } catch (e) { window[name] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    window[name] = function (data) { cleanup(); done(null, data); };
    script.onerror = function () { cleanup(); done(new Error("network")); };
    params.callback = name;
    var q = [];
    for (var k in params) {
      if (params.hasOwnProperty(k)) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
    }
    script.src = endpoint + (endpoint.indexOf("?") < 0 ? "?" : "&") + q.join("&");
    document.body.appendChild(script);
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function setState(msg) {
    listBox.innerHTML = '<p class="gift-state">' + escapeHtml(msg) + "</p>";
  }
  function setNote(msg) {
    var note = document.getElementById("gift-note");
    if (!note) {
      note = document.createElement("p");
      note.id = "gift-note";
      note.className = "gift-note";
      submitBtn.parentNode.insertBefore(note, submitBtn);
    }
    note.textContent = msg;
  }
  function clearNote() {
    var note = document.getElementById("gift-note");
    if (note) note.parentNode.removeChild(note);
  }

  /* ---------- Cargar y pintar la lista ---------- */
  function loadList() {
    clearNote();
    submitBtn.disabled = true;
    setState("Cargando lista…");
    jsonp({ action: "list" }, function (err, data) {
      if (err || !data || !data.ok) { setState("No se pudo cargar la lista. Intenta más tarde."); return; }
      renderList(data.items || []);
    });
  }
  function renderList(items) {
    if (!items.length) {
      setState("¡Todos los regalos ya fueron reservados! Gracias por tu cariño. 💛");
      submitBtn.disabled = true;
      return;
    }
    listBox.innerHTML = items.map(function (it) {
      return '<label class="gift-item">' +
        '<input type="checkbox" value="' + it.row + '" />' +
        "<span>" + escapeHtml(it.name) + "</span>" +
        "</label>";
    }).join("");
    submitBtn.disabled = false;
  }
  function checkedRows() {
    var boxes = listBox.querySelectorAll('input[type="checkbox"]:checked');
    var rows = [];
    for (var i = 0; i < boxes.length; i++) rows.push(boxes[i].value);
    return rows;
  }

  /* ---------- Reservar ---------- */
  function submit() {
    var familia = familiaInput.value.trim();
    if (!familia) { setNote("Escribe tu nombre o familia."); familiaInput.focus(); return; }
    var rows = checkedRows();
    if (!rows.length) { setNote("Selecciona al menos un regalo."); return; }
    clearNote();

    submitBtn.disabled = true;
    submitBtn.textContent = "Reservando…";
    jsonp({ action: "reserve", familia: familia, rows: rows.join(",") }, function (err, data) {
      submitBtn.textContent = "Reservar seleccionados";
      if (err || !data || !data.ok) {
        submitBtn.disabled = false;
        setNote((data && data.error) || "No se pudo reservar. Intenta de nuevo.");
        return;
      }
      showSuccess(data);
    });
  }
  function showSuccess(data) {
    var parts = [];
    if (data.reserved && data.reserved.length) {
      parts.push("Reservaste: " + data.reserved.join(", ") + ".");
      parts.push("Si desean hacernos llegar su regalo antes o después del día, con mucho gusto los recibimos en casa. Lo importante es que ese día disfruten sin preocupaciones.");
    }
    if (data.taken && data.taken.length) parts.push("Estos ya los había tomado otra familia: " + data.taken.join(", ") + ".");
    if (!parts.length) parts.push("No se reservó ningún regalo.");
    successMsg.textContent = parts.join(" ");
    body.hidden = true;
    success.hidden = false;
  }

  /* ---------- Abrir / cerrar ---------- */
  function open() {
    if (!endpoint) return;
    clearNote();
    body.hidden = false; success.hidden = true;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    var c = document.getElementById("gift-close"); if (c) c.focus();
    loadList();
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  window.GIFTS = {
    open: open, close: close,
    isOpen: function () { return modal.classList.contains("open"); },
    enabled: !!endpoint
  };

  document.getElementById("gift-close").addEventListener("click", close);
  document.getElementById("gift-done").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  submitBtn.addEventListener("click", submit);
})();
