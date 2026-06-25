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

  // Confeti dorado al llegar a 0 (una sola vez). Vanilla, sin librerías.
  function celebrate() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cv = document.createElement("canvas");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:300";
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d");
    function size() { cv.width = innerWidth; cv.height = innerHeight; }
    size(); addEventListener("resize", size);
    var colors = ["#b3925a", "#cbb78a", "#868f74", "#f4f1e9", "#525a43"];
    var P = [];
    for (var i = 0; i < 140; i++) {
      P.push({ x: cv.width * (0.2 + 0.6 * (i / 140)), y: -20 - (i % 30) * 18,
        vx: (i % 7 - 3) * 0.6, vy: 2 + (i % 5), r: 4 + (i % 4) * 2,
        rot: i, vr: (i % 6 - 3) * 0.1, c: colors[i % colors.length] });
    }
    var start = null;
    function frame(t) {
      if (start === null) start = t;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var j = 0; j < P.length; j++) {
        var p = P[j]; p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
      }
      if (t - start < 6500) requestAnimationFrame(frame);
      else { cv.remove(); removeEventListener("resize", size); }
    }
    requestAnimationFrame(frame);
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      var box = document.getElementById("countdown");
      if (box) {
        box.innerHTML =
          '<div style="font-family:var(--serif);font-size:clamp(18px,6vw,26px);color:var(--gold);text-align:center;width:100%">¡Hoy es el gran día! ♥</div>';
      }
      clearInterval(timer);
      celebrate();
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
