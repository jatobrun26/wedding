/* ============================================================
   Jamil & Gabriela — invitación interactiva
   ============================================================ */
(function () {
  "use strict";
  var cfg = window.WEDDING_CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- Personaliza textos del intro ---------- */
  if (cfg.names) $(".intro-names").textContent = cfg.names;
  if (cfg.initials) $(".seal-initials").textContent = cfg.initials.left + "&" + cfg.initials.right;

  /* ---------- Portada ---------- */
  var heroImg = $("#hero-img");
  if (heroImg && cfg.heroImage) heroImg.src = cfg.heroImage;
  if (cfg.displayNames) {
    var hn = $("#hero-names");
    if (hn) {
      var parts = cfg.displayNames.split("&");
      hn.innerHTML = parts.length === 2
        ? parts[0].trim() + ' <span class="amp">&amp;</span> ' + parts[1].trim()
        : cfg.displayNames;
    }
  }

  /* ---------- Mensaje ---------- */
  var msgImg = $("#msg-img");
  if (msgImg && cfg.messageImage) msgImg.src = cfg.messageImage;
  var msgText = $("#msg-text");
  if (msgText && cfg.welcomeText) msgText.textContent = cfg.welcomeText;

  /* ---------- Construye slides dinámicos (galería / video) ---------- */
  var wrapper = $("#wrapper");
  var galleryList = (cfg.gallery || []).map(function (g) {
    return { webp: "assets/gallery/" + g + ".webp", jpg: "assets/gallery/" + g + ".jpg" };
  });

  if (galleryList.length) {
    var thumbs = galleryList.slice(0, 6).map(function (g, i) {
      return '<img src="' + g.webp + '" alt="Foto ' + (i + 1) + '" data-i="' + i + '" loading="lazy" />';
    }).join("");
    var gslide = document.createElement("div");
    gslide.className = "swiper-slide";
    gslide.innerHTML =
      '<div class="panel">' +
        '<span class="eyebrow">Nuestra historia</span>' +
        '<h2 class="serif-caps">Galería</h2>' +
        '<div class="grid" id="grid">' + thumbs + '</div>' +
        '<button class="btn" id="btn-gallery-all" type="button">Ver todas las fotos</button>' +
        '<div class="leaf-sep">&#10086;</div>' +
      '</div>';
    wrapper.appendChild(gslide);
  }

  if (cfg.videoUrl) {
    var poster = galleryList.length ? galleryList[Math.min(6, galleryList.length - 1)].webp : "assets/pages/page1.webp";
    var vslide = document.createElement("div");
    vslide.className = "swiper-slide";
    vslide.innerHTML =
      '<div class="panel vpanel" id="vpanel">' +
        '<img class="vposter" src="' + poster + '" alt="" />' +
        '<div class="vplay">&#9658;</div>' +
        '<div class="vtitle">Nuestro video</div>' +
      '</div>';
    wrapper.appendChild(vslide);
  }

  /* ---------- Swiper (story + flip) ---------- */
  var swiper = new Swiper("#deck", {
    effect: "flip",
    flipEffect: { slideShadows: false },
    grabCursor: true,
    speed: reduce ? 0 : 750,
    keyboard: { enabled: true },
    threshold: 6,
  });

  /* ---------- Story progress bars ---------- */
  var progress = $("#progress");
  var total = swiper.slides.length;
  for (var i = 0; i < total; i++) {
    var seg = document.createElement("div");
    seg.className = "seg";
    seg.innerHTML = "<i></i>";
    progress.appendChild(seg);
  }
  function paintProgress() {
    var segs = progress.children;
    for (var k = 0; k < segs.length; k++) {
      segs[k].classList.toggle("done", k < swiper.activeIndex);
      segs[k].classList.toggle("active", k === swiper.activeIndex);
    }
    // hide the cover hint once we move on
    var hint = $("#hint");
    if (hint) hint.style.opacity = swiper.activeIndex === 0 ? "" : "0";
  }
  swiper.on("slideChange", paintProgress);
  paintProgress();

  /* ---------- Tap to navigate (story style) ---------- */
  var IGNORE = ".actionbar, .btn, .grid, .vpanel, .music-btn, a, input, textarea, label";
  $("#deck").addEventListener("click", function (e) {
    if (anyOverlayOpen()) return;
    if (e.target.closest(IGNORE)) return;
    if (e.clientX < window.innerWidth * 0.28) swiper.slidePrev();
    else swiper.slideNext();
  });

  function anyOverlayOpen() {
    return (window.RSVP && window.RSVP.isOpen()) ||
      $("#lightbox").classList.contains("open") ||
      $("#video-modal").classList.contains("open") ||
      !$("#intro").classList.contains("gone");
  }

  /* ---------- Intro: envelope ---------- */
  var intro = $("#intro");
  function openInvitation() {
    intro.classList.add("opening");
    setTimeout(function () {
      intro.classList.add("gone");
      startPetals();
      maybeStartMusic();
      paintProgress();
    }, reduce ? 50 : 750);
  }
  $("#intro-open").addEventListener("click", openInvitation);
  $("#envelope").addEventListener("click", openInvitation);

  /* ---------- Petals ---------- */
  function startPetals() {
    if (reduce) return;
    var box = $("#petals");
    var leaf = "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C7 7 4 11 4 16a8 8 0 0016 0c0-5-3-9-8-14z" fill="none" stroke="%23b1924f" stroke-width="1.2"/></svg>'
    );
    for (var n = 0; n < 14; n++) {
      var p = document.createElement("img");
      p.src = leaf;
      p.className = "petal";
      var size = 10 + Math.round(Math.random() * 16);
      p.style.cssText =
        "position:fixed;z-index:5;pointer-events:none;width:" + size + "px;left:" +
        (Math.random() * 100) + "vw;top:-8vh;opacity:" + (0.35 + Math.random() * 0.4) +
        ";animation:fall " + (9 + Math.random() * 9) + "s linear " + (Math.random() * 8) +
        "s infinite;--rot:" + (Math.random() * 360) + "deg";
      box.appendChild(p);
    }
  }

  /* ---------- Map + Add to Calendar (slide 3) ---------- */
  $("#btn-map").addEventListener("click", function () {
    var q = (cfg.mapLat && cfg.mapLng)
      ? encodeURIComponent(cfg.mapLat + "," + cfg.mapLng)
      : encodeURIComponent(cfg.mapQuery || cfg.venueCity || "");
    window.open("https://www.google.com/maps/search/?api=1&query=" + q, "_blank", "noopener");
  });

  $("#btn-cal").addEventListener("click", function () {
    var start = new Date(cfg.calStartISO || cfg.dateISO);
    var end = cfg.calEndISO
      ? new Date(cfg.calEndISO)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    function z(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//JG//Invitacion//ES",
      "BEGIN:VEVENT",
      "UID:jg-" + start.getTime() + "@boda",
      "DTSTART:" + z(start),
      "DTEND:" + z(end),
      "SUMMARY:" + (cfg.ceremonyTitle || "Boda"),
      "LOCATION:" + (cfg.venueCity || ""),
      "DESCRIPTION:" + (cfg.ceremonyDetails || ""),
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "boda-jamil-gabriela.ics";
    document.body.appendChild(a); a.click(); a.remove();
  });

  /* ---------- RSVP button ---------- */
  $("#btn-rsvp").addEventListener("click", function () { if (window.RSVP) window.RSVP.open(); });

  /* ---------- Gallery lightbox ---------- */
  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbIdx = 0;
  function showLb(i) {
    lbIdx = (i + galleryList.length) % galleryList.length;
    lbImg.src = galleryList[lbIdx].jpg;
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
  }
  function closeLb() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); lbImg.src = ""; }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (t.matches && t.matches("#grid img")) showLb(+t.dataset.i);
    if (t.id === "btn-gallery-all") showLb(0);
  });
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", function () { showLb(lbIdx - 1); });
  $("#lb-next").addEventListener("click", function () { showLb(lbIdx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  /* ---------- Video modal ---------- */
  var vmodal = $("#video-modal"), vframe = $("#video-frame");
  function embedUrl(url) {
    var m;
    if ((m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/)))
      return "https://www.youtube.com/embed/" + m[1] + "?autoplay=1&rel=0";
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1";
    return url;
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("#vpanel")) {
      vframe.innerHTML = '<iframe src="' + embedUrl(cfg.videoUrl) +
        '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      vmodal.classList.add("open"); vmodal.setAttribute("aria-hidden", "false");
    }
  });
  function closeVideo() { vmodal.classList.remove("open"); vmodal.setAttribute("aria-hidden", "true"); vframe.innerHTML = ""; }
  $("#video-close").addEventListener("click", closeVideo);
  vmodal.addEventListener("click", function (e) { if (e.target === vmodal) closeVideo(); });

  /* ---------- Music ---------- */
  var audio = $("#bg-audio"), mbtn = $("#music-btn");
  function maybeStartMusic() {
    if (!cfg.musicSrc) return;
    if (localStorage.getItem("jg-music") === "on") playMusic();
  }
  function playMusic() {
    audio.play().then(function () {
      mbtn.classList.add("playing");
      localStorage.setItem("jg-music", "on");
    }).catch(function () {});
  }
  function pauseMusic() {
    audio.pause(); mbtn.classList.remove("playing");
    localStorage.setItem("jg-music", "off");
  }
  if (cfg.musicSrc) {
    audio.src = cfg.musicSrc;
    mbtn.hidden = false;
    mbtn.addEventListener("click", function () {
      if (audio.paused) playMusic(); else pauseMusic();
    });
  }

  /* ---------- Deep link / preview: ?s=<index> (&rsvp=1) ---------- */
  var qs = new URLSearchParams(location.search);
  if (qs.has("s")) {
    intro.classList.add("gone");
    swiper.slideTo(parseInt(qs.get("s"), 10) || 0, 0);
    startPetals();
    paintProgress();
    if (qs.get("rsvp") === "1" && window.RSVP) window.RSVP.open();
  }

  /* ---------- Escape closes overlays ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (lb.classList.contains("open")) closeLb();
      else if (vmodal.classList.contains("open")) closeVideo();
      else if (window.RSVP && window.RSVP.isOpen()) window.RSVP.close();
    }
    if (e.key === "ArrowLeft" && lb.classList.contains("open")) showLb(lbIdx - 1);
    if (e.key === "ArrowRight" && lb.classList.contains("open")) showLb(lbIdx + 1);
  });
})();
