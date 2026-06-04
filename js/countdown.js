/* Live countdown to the ceremony. Updates #cd-d/h/m/s every second. */
(function () {
  var cfg = window.WEDDING_CONFIG || {};
  var target = new Date(cfg.dateISO).getTime();
  var els = {
    d: document.getElementById("cd-d"),
    h: document.getElementById("cd-h"),
    m: document.getElementById("cd-m"),
    s: document.getElementById("cd-s"),
  };
  if (!els.d || isNaN(target)) return;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      var box = document.getElementById("countdown");
      if (box) {
        box.innerHTML =
          '<div style="font-family:var(--serif);font-size:clamp(18px,6vw,26px);color:var(--gold);text-align:center;width:100%">¡Hoy es el gran día! ♥</div>';
      }
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    els.d.textContent = Math.floor(s / 86400);
    els.h.textContent = pad(Math.floor((s % 86400) / 3600));
    els.m.textContent = pad(Math.floor((s % 3600) / 60));
    els.s.textContent = pad(s % 60);
  }

  tick();
  var timer = setInterval(tick, 1000);
})();
