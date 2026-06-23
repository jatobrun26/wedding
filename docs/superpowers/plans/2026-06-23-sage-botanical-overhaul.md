# Refactor visual "Sage Botanical" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the wedding invitation to the Canva "sage/cream botanical" style while keeping the Swiper flip deck and all existing functionality.

**Architecture:** Slides 1–4 (currently flat PDF `<img>`s) become themed HTML `.panel` slides hydrated from `config.js` by `main.js`. Three new slides (Itinerario, Nuestra historia, Regalos) and a standalone Countdown slide are added. Gallery/Video stay JS-injected. A per-slide band modifier (`.slide--cream` / `.slide--sage`) drives the alternating Canva color rhythm; inline-SVG eucalyptus corners decorate slides.

**Tech Stack:** Static site, no build. HTML + vanilla CSS + vanilla JS. Swiper 11 (CDN). Google Fonts: Cormorant Garamond, Great Vibes, Jost. Verification is manual via `serve.py`.

## Global Constraints

- No build step, no framework, no new runtime dependencies. Plain ES5-style JS (the codebase uses `var` + IIFE; match it).
- `js/config.js` remains the ONLY file a non-developer edits for data. All copy/images/URLs come from config.
- Preserve all existing behavior: intro envelope, petals, story progress bars, tap-zone navigation, countdown logic (`countdown.js`), RSVP→WhatsApp flow (`rsvp.js`), map open, `.ics` download, gallery lightbox, video modal, music toggle, deep-links `?s=N` / `?s=N&rsvp=1`.
- Countdown target stays `config.dateISO` (currently `2026-08-01T16:30:00-05:00`) — do NOT change the time; it is a user-pending decision.
- Decorative elements must be `aria-hidden="true"` and `pointer-events:none` so they never capture tap-zone navigation.
- Spanish copy throughout. Couple display name on hero is "Jamil & Gaby".
- Palette (verbatim): `--cream:#efece2`, `--cream-2:#e7e2d4`, `--sage:#868f74`, `--sage-deep:#6f775d`, `--green-ink:#525a43`, `--on-sage:#f4f1e9`, `--gold:#b3925a`, `--ink:#2c2a24`, `--muted:#8a8575`.
- Verify each slide at mobile width (~390px) — the deck is a phone-first stories app.

## File Structure

- `js/config.js` — add new data fields (names, images, address, welcome text, itinerary, story, gift text/URL).
- `index.html` — rebuild `#wrapper`: slides 1–4 become `.panel` HTML; add Countdown, Itinerario, Historia, Regalos panels; re-skin RSVP panel. Update `theme-color`.
- `css/styles.css` — new tokens; `.slide--cream/--sage` bands; eucalyptus corner SVG; layouts for hero, message, details, dress-code (swatches), countdown, itinerary timeline, story, gifts; re-skin RSVP/intro/petals/progress/gallery/video/modals.
- `js/main.js` — hydrate new HTML slides from config (hero, message, details, itinerary, story, gifts); wire "Ver nuestra lista" button; keep gallery/video injection but place them last; update petal stroke color.
- `js/countdown.js` — no logic change (the `#countdown` element just lives on its own slide now).
- `js/rsvp.js` — no change.

## Slide order (final)
1 Portada (cream) · 2 Mensaje (sage) · 3 Celebra con nosotros (cream) · 4 Dress code (sage) · 5 Countdown (cream) · 6 Itinerario (sage) · 7 Nuestra historia (cream) · 8 Regalos (sage) · 9 RSVP (cream) · 10 Galería (sage, JS) · 11 Video (cream, JS, conditional).

> **Deep-link note:** slide indices shift. After this plan, `?s=8` ≈ RSVP. The `?s=N&rsvp=1` shortcut still opens the RSVP modal regardless of index because it calls `RSVP.open()` directly.

---

### Task 1: Config fields + theme tokens + eucalyptus corners (foundation)

**Files:**
- Modify: `js/config.js` (add fields before closing `}`)
- Modify: `css/styles.css:2-14` (`:root` tokens) and base slide CSS
- Modify: `index.html` (`<meta name="theme-color">`)

**Interfaces:**
- Produces (config fields consumed by later tasks): `displayNames` (string), `heroImage`/`messageImage`/`storyImage` (string paths), `addressLines` (string[]), `welcomeText` (string), `itinerary` (`{time,label,icon}[]`, icon ∈ `rings|camera|dinner|party`), `story` (string), `giftText` (string), `giftListUrl` (string), `mapsButtonText` ("Ver mapa").
- Produces (CSS): tokens above; classes `.slide--cream`, `.slide--sage`, `.euca` (corner decoration).

- [ ] **Step 1: Add config fields**

In `js/config.js`, insert these keys inside the `window.WEDDING_CONFIG = { ... }` object (place after the `gallery` array, before the closing `}`; add a comma after the `gallery` array):

```js
  ,

  // ---- Refactor "Sage Botanical" ----
  displayNames: "Jamil & Gaby",            // portada (resto del sitio: "Jamil & Gabriela")

  // Fotos de las secciones (reemplaza por las reales cuando las tengas)
  heroImage:    "assets/gallery/g01.jpg",  // TODO: foto del lugar
  messageImage: "assets/gallery/g05.jpg",  // TODO: foto de la pareja
  storyImage:   "assets/gallery/g10.jpg",  // TODO: foto "La pedida"

  // Detalles
  addressLines: ["La Puntilla, Samborondón", "Av. Principal, calle cuarta sur"], // TODO: dirección real
  mapsButtonText: "Ver mapa",

  // Mensaje de bienvenida
  welcomeText: "Después de tantos momentos, risas y sueños compartidos, ha llegado el día que siempre imaginamos. Nos llena de felicidad invitarte a celebrar el inicio de nuestra nueva historia.",

  // Itinerario
  itinerary: [
    { time: "5:00pm", label: "Ceremonia", icon: "rings" },
    { time: "6:00pm", label: "¡Fotos!",   icon: "camera" },
    { time: "8:00pm", label: "Cena",      icon: "dinner" },
    { time: "9:00pm", label: "¡Fiesta!",  icon: "party" }
  ],

  // Nuestra historia
  story: "Hay encuentros que parecen escritos por el destino. El nuestro comenzó como una amistad inesperada y creció entre conversaciones, sueños compartidos y la certeza de que juntos todo es posible. Cinco años después seguimos eligiéndonos cada día y estamos listos para comenzar la aventura más importante de nuestras vidas.",

  // Regalos
  giftText: "Desde el inicio de nuestra historia hemos compartido sueños, metas y proyectos que nos ilusionan profundamente. Si desean acompañarnos también en esta nueva etapa, hemos preparado una lista con algunos detalles que nos ayudarán a construir nuestro hogar y seguir creando recuerdos juntos.",
  giftListUrl: ""                          // vacío ⇒ se oculta el botón
```

- [ ] **Step 2: Replace theme tokens**

In `css/styles.css`, replace the `:root` block (lines ~2–14) with:

```css
:root{
  --cream:#efece2;
  --cream-2:#e7e2d4;
  --sage:#868f74;
  --sage-deep:#6f775d;
  --green-ink:#525a43;
  --on-sage:#f4f1e9;
  --gold:#b3925a;
  --gold-soft:#cbb78a;
  --ink:#2c2a24;
  --muted:#8a8575;
  --shadow:0 18px 50px rgba(40,42,30,.20);
  --serif:"Cormorant Garamond", Georgia, serif;
  --script:"Great Vibes", cursive;
  --sans:"Jost", system-ui, sans-serif;
}
```

- [ ] **Step 3: Add band + eucalyptus base CSS**

Append to `css/styles.css`:

```css
/* ===================== Bands (Canva rhythm) ===================== */
.slide--cream{ background:var(--cream); color:var(--ink); }
.slide--sage { background:var(--sage); color:var(--on-sage); }
.slide--sage .eyebrow,
.slide--sage h2, .slide--sage h3{ color:var(--on-sage); }
.slide--cream h2, .slide--cream h3{ color:var(--green-ink); }

/* Generic content panel for HTML slides */
.panel{
  position:relative; width:min(100vw,560px); height:100svh;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:14px; padding:9vh 28px; text-align:center; overflow:hidden;
}

/* ===================== Eucalyptus corner (decorative) ===================== */
.euca{
  position:absolute; width:128px; height:128px; opacity:.55;
  pointer-events:none; z-index:1;
  background:no-repeat center/contain;
  background-image:url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23b3925a' stroke-width='1.4'%3E%3Cpath d='M10 90 C40 70 60 45 78 14'/%3E%3Cg fill='%23b3925a' fill-opacity='.5' stroke='none'%3E%3Cellipse cx='22' cy='74' rx='9' ry='5' transform='rotate(-38 22 74)'/%3E%3Cellipse cx='36' cy='60' rx='9' ry='5' transform='rotate(-40 36 60)'/%3E%3Cellipse cx='49' cy='46' rx='9' ry='5' transform='rotate(-42 49 46)'/%3E%3Cellipse cx='61' cy='32' rx='8' ry='4.5' transform='rotate(-44 61 32)'/%3E%3Cellipse cx='71' cy='20' rx='7' ry='4' transform='rotate(-46 71 20)'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
.euca.tl{ top:-6px; left:-6px; }
.euca.tr{ top:-6px; right:-6px; transform:scaleX(-1); }
.euca.bl{ bottom:-6px; left:-6px; transform:scaleY(-1); }
.euca.br{ bottom:-6px; right:-6px; transform:scale(-1,-1); }
```

- [ ] **Step 4: Update theme-color**

In `index.html`, change `<meta name="theme-color" content="#f4f1e9" />` to:

```html
  <meta name="theme-color" content="#efece2" />
```

- [ ] **Step 5: Verify foundation loads**

Run: `cd "/Users/jamiltorres/Documents/utils" && python3 serve.py` then open `http://localhost:8123`.
Expected: page loads with no console errors; existing image slides still display (background tint slightly warmer). No layout break. `config.js` parses (no `Uncaught SyntaxError`). Stop the server when done (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git add js/config.js css/styles.css index.html
git commit -m "feat: nuevos tokens sage/crema, bandas y esquinas de eucalipto + campos de config"
```

---

### Task 2: Portada slide (hero)

**Files:**
- Modify: `index.html` (replace slide 1 `<div class="swiper-slide">` … Portada block)
- Modify: `css/styles.css` (append hero styles)
- Modify: `js/main.js` (hydrate hero from config)

**Interfaces:**
- Consumes: `displayNames`, `heroImage`, `dateISO` (for date display we use a static "01 · 08 · 2026" string per Canva), `welcomeText` (not here). Existing `#hint` behavior preserved.
- Produces: element IDs `#hero-img`, `#hero-names`.

- [ ] **Step 1: Replace the Portada slide HTML**

In `index.html`, replace the entire `<!-- 1 · Portada -->` slide block with:

```html
      <!-- 1 · Portada -->
      <div class="swiper-slide slide--cream">
        <div class="panel hero">
          <div class="hero-photo">
            <img id="hero-img" src="" alt="Lugar de la boda" fetchpriority="high" />
            <div class="hero-fade"></div>
          </div>
          <p class="hero-eyebrow">Nos casamos</p>
          <h1 class="hero-names" id="hero-names">Jamil <span class="amp">&amp;</span> Gaby</h1>
          <p class="hero-date">01 · 08 · 2026</p>
          <span class="hero-cta">¡Nos casamos!</span>
          <div class="euca br" aria-hidden="true"></div>
          <div class="hint" id="hint">
            <span>Desliza para continuar</span>
            <span class="hint-chev">›</span>
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Append hero CSS**

Append to `css/styles.css`:

```css
/* ===================== Hero / Portada ===================== */
.hero{ justify-content:flex-start; gap:0; padding:0; }
.hero-photo{ position:relative; width:100%; height:58svh; overflow:hidden; }
.hero-photo img{ width:100%; height:100%; object-fit:cover; display:block; }
.hero-fade{ position:absolute; inset:auto 0 -1px 0; height:42%;
  background:linear-gradient(to bottom, rgba(239,236,226,0), var(--cream)); }
.hero-eyebrow{ font-family:var(--script); color:var(--gold); font-size:clamp(26px,8vw,38px); margin:14px 0 0; }
.hero-names{ font-family:var(--serif); font-weight:500; color:var(--green-ink);
  font-size:clamp(34px,11vw,52px); letter-spacing:.5px; margin:2px 0 0; line-height:1.05; }
.hero-names .amp{ color:var(--gold); font-style:italic; }
.hero-date{ font-family:var(--sans); letter-spacing:.32em; color:var(--muted);
  font-size:clamp(12px,3.6vw,15px); margin:10px 0 18px; }
.hero-cta{ display:inline-block; background:var(--sage); color:var(--on-sage);
  font-family:var(--sans); letter-spacing:.06em; font-size:14px;
  padding:11px 26px; border-radius:999px; box-shadow:var(--shadow); }
```

- [ ] **Step 3: Hydrate hero in main.js**

In `js/main.js`, find the intro-personalization block (around line 10–12) and add hero hydration right after it:

```js
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
```

- [ ] **Step 4: Verify hero**

Run `python3 serve.py`, open `http://localhost:8123`, open the invitation. Slide 1 shows: venue photo (from `heroImage`) fading into cream, script "Nos casamos", serif "Jamil & Gaby" with gold ampersand, spaced date, sage pill, eucalyptus corner, and the swipe hint. No console errors. Check at 390px width.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: portada HTML temática (foto + nombres + fecha + CTA)"
```

---

### Task 3: Mensaje slide

**Files:**
- Modify: `index.html` (replace slide 2)
- Modify: `css/styles.css` (append message styles)
- Modify: `js/main.js` (hydrate message)

**Interfaces:**
- Consumes: `messageImage`, `welcomeText`.
- Produces: IDs `#msg-img`, `#msg-text`.

- [ ] **Step 1: Replace the Mensaje slide HTML**

Replace the `<!-- 2 · Mensaje -->` block in `index.html` with:

```html
      <!-- 2 · Mensaje -->
      <div class="swiper-slide slide--sage">
        <div class="panel message">
          <div class="msg-photo"><img id="msg-img" src="" alt="Jamil y Gaby" loading="lazy" /></div>
          <p class="msg-text" id="msg-text"></p>
          <div class="euca tr" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append message CSS**

```css
/* ===================== Mensaje ===================== */
.message{ gap:26px; }
.msg-photo{ width:min(76%,320px); aspect-ratio:4/5; overflow:hidden; border-radius:6px; box-shadow:var(--shadow); }
.msg-photo img{ width:100%; height:100%; object-fit:cover; display:block; }
.msg-text{ font-family:var(--serif); font-size:clamp(18px,5.2vw,24px); line-height:1.55;
  color:var(--on-sage); max-width:30ch; }
```

- [ ] **Step 3: Hydrate message in main.js**

Add after the Portada hydration block:

```js
  /* ---------- Mensaje ---------- */
  var msgImg = $("#msg-img");
  if (msgImg && cfg.messageImage) msgImg.src = cfg.messageImage;
  var msgText = $("#msg-text");
  if (msgText && cfg.welcomeText) msgText.textContent = cfg.welcomeText;
```

- [ ] **Step 4: Verify message**

Reload. Slide 2: sage background, couple photo card, serif welcome text in cream from `welcomeText`, eucalyptus top-right. Verify at 390px.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: slide Mensaje HTML (foto pareja + texto de bienvenida)"
```

---

### Task 4: Celebra con nosotros (detalles)

**Files:**
- Modify: `index.html` (replace slide 3, the Detalles/actionbar block)
- Modify: `css/styles.css` (append details styles)
- Modify: `js/main.js` (hydrate address; map/cal buttons already wired)

**Interfaces:**
- Consumes: `addressLines`, `mapsButtonText`. Reuses existing `#btn-map` (map open) and `#btn-cal` (.ics) handlers — keep those IDs.
- Produces: IDs `#detail-address` (container), keeps `#btn-map`, `#btn-cal`.

- [ ] **Step 1: Replace the Detalles slide HTML**

Replace the `<!-- 3 · Detalles + acciones -->` block with:

```html
      <!-- 3 · Celebra con nosotros -->
      <div class="swiper-slide slide--cream">
        <div class="panel details">
          <h2 class="serif-caps">Celebra con nosotros</h2>
          <p class="script gold sub">Ceremonia civil &amp; Recepción</p>
          <div class="detail-cols">
            <div class="detail-col">
              <span class="d-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>
              </span>
              <p class="d-strong">01 agosto 2026</p>
              <p class="d-soft">4:00pm</p>
            </div>
            <div class="detail-col">
              <span class="d-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              </span>
              <div class="d-soft" id="detail-address"></div>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn" id="btn-map" type="button">Ver mapa</button>
            <button class="btn btn-ghost" id="btn-cal" type="button">Agendar</button>
          </div>
          <div class="euca bl" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append details + shared button/eyebrow CSS**

```css
/* ===================== Detalles / Celebra ===================== */
.serif-caps{ font-family:var(--serif); font-weight:600; text-transform:uppercase;
  letter-spacing:.14em; font-size:clamp(22px,6.6vw,30px); margin:0; }
.script{ font-family:var(--script); line-height:1.2; }
.gold{ color:var(--gold); }
.details .sub{ font-size:clamp(24px,7vw,32px); margin:2px 0 18px; }
.detail-cols{ display:flex; gap:18px; width:100%; justify-content:center; }
.detail-col{ flex:1 1 0; max-width:200px; display:flex; flex-direction:column;
  align-items:center; gap:6px; }
.d-ico svg{ width:34px; height:34px; color:var(--gold); }
.d-strong{ font-family:var(--serif); font-size:20px; margin:4px 0 0; color:var(--green-ink); }
.d-soft{ font-family:var(--sans); font-size:14px; color:var(--muted); line-height:1.45; margin:0; }
.btn-row{ display:flex; gap:12px; margin-top:22px; flex-wrap:wrap; justify-content:center; }
.btn{ background:var(--sage); color:var(--on-sage); border:none; border-radius:999px;
  font-family:var(--sans); letter-spacing:.05em; font-size:14px; padding:11px 24px; box-shadow:var(--shadow); }
.btn-ghost{ background:transparent; color:var(--green-ink); border:1.4px solid var(--sage); box-shadow:none; }
```

- [ ] **Step 3: Hydrate address in main.js**

Add after the Mensaje hydration block:

```js
  /* ---------- Detalles ---------- */
  var addrBox = $("#detail-address");
  if (addrBox && cfg.addressLines) {
    addrBox.innerHTML = cfg.addressLines.map(function (l) {
      return "<div>" + l + "</div>";
    }).join("");
  }
  var mapBtn = $("#btn-map");
  if (mapBtn && cfg.mapsButtonText) mapBtn.textContent = cfg.mapsButtonText;
```

> The existing `$("#btn-map")` and `$("#btn-cal")` click handlers (map open / .ics) remain unchanged and still match these IDs.

- [ ] **Step 4: Verify details**

Reload. Slide 3 (cream): "CELEBRA CON NOSOTROS", script subtitle, two icon columns (calendar → date/time, pin → address lines), "Ver mapa" (sage) + "Agendar" (ghost) buttons. Click "Ver mapa" → opens Google Maps at the configured coords in a new tab. Click "Agendar" → downloads `boda-jamil-gabriela.ics`. Verify at 390px.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: slide Celebra con nosotros (detalles + mapa + agendar)"
```

---

### Task 5: Dress code slide

**Files:**
- Modify: `index.html` (replace slide 4)
- Modify: `css/styles.css` (append dress-code styles)

**Interfaces:**
- Consumes: nothing from config (static copy + swatches per Canva).
- Produces: no IDs needed.

- [ ] **Step 1: Replace the Dress code slide HTML**

```html
      <!-- 4 · Dress code -->
      <div class="swiper-slide slide--sage">
        <div class="panel dress">
          <h2 class="serif-caps">Dress code</h2>
          <p class="script sub">Elegancia moderna</p>
          <div class="dress-cols">
            <div class="dress-col">
              <span class="dr-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M9 3h6l-1 4 3 14H7l3-14-1-4z"/></svg>
              </span>
              <h3>Mujeres</h3>
              <p>Vestido largo, telas fluidas y elegantes, tacones.</p>
            </div>
            <div class="dress-col">
              <span class="dr-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M7 3l5 4 5-4 3 18H4L7 3z"/><path d="M12 7v14"/></svg>
              </span>
              <h3>Hombres</h3>
              <p>Traje formal, tonos neutros, corbata opcional.</p>
            </div>
          </div>
          <div class="swatches" aria-hidden="true">
            <span style="background:#8a9479"></span>
            <span style="background:#b9c2a6"></span>
            <span style="background:#e7d8c2"></span>
            <span style="background:#e9c9b8"></span>
            <span style="background:#d8b9c0"></span>
            <span style="background:#c2c9d8"></span>
            <span style="background:#efe7cf"></span>
          </div>
          <p class="dress-note">Por favor evita el color blanco y crema.</p>
          <div class="euca tl" aria-hidden="true"></div>
          <div class="euca br" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append dress-code CSS**

```css
/* ===================== Dress code ===================== */
.dress .sub{ font-size:clamp(24px,7vw,32px); color:var(--on-sage); margin:0 0 22px; }
.dress-cols{ display:flex; gap:22px; width:100%; justify-content:center; }
.dress-col{ flex:1 1 0; max-width:180px; display:flex; flex-direction:column; align-items:center; gap:6px; }
.dr-ico svg{ width:40px; height:40px; color:var(--on-sage); opacity:.92; }
.dress-col h3{ font-family:var(--serif); font-size:21px; margin:6px 0 0; font-weight:500; }
.dress-col p{ font-family:var(--sans); font-size:13px; line-height:1.5; color:var(--on-sage); opacity:.86; margin:0; }
.swatches{ display:flex; gap:0; margin:26px 0 8px; border-radius:6px; overflow:hidden; box-shadow:var(--shadow); }
.swatches span{ width:30px; height:30px; display:block; }
.dress-note{ font-family:var(--sans); font-size:12px; letter-spacing:.04em; color:var(--on-sage); opacity:.8; margin:4px 0 0; }
```

- [ ] **Step 3: Verify dress code**

Reload. Slide 4 (sage): "DRESS CODE", script "Elegancia moderna", two columns (dress icon → Mujeres, suit icon → Hombres) with guidance, a row of 7 pastel swatches, the note line, eucalyptus corners. Verify at 390px (columns shouldn't overflow).

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: slide Dress code (Mujeres/Hombres + paleta de swatches)"
```

---

### Task 6: Countdown slide

**Files:**
- Modify: `index.html` (insert new slide 5 after Dress code)
- Modify: `css/styles.css` (append countdown styles)

**Interfaces:**
- Consumes: reuses existing `#countdown`, `#cd-d/#cd-h/#cd-m/#cd-s` element IDs so `countdown.js` keeps working unchanged.
- Produces: standalone countdown panel.

- [ ] **Step 1: Insert the Countdown slide HTML**

Insert this block immediately AFTER the Dress code slide and BEFORE the RSVP slide:

```html
      <!-- 5 · Countdown -->
      <div class="swiper-slide slide--cream">
        <div class="panel cd-panel">
          <h2 class="serif-caps">Falta poco para</h2>
          <p class="script gold sub">el gran día</p>
          <div class="countdown big" id="countdown" aria-live="polite">
            <div class="cd-cell"><b id="cd-d">--</b><span>días</span></div>
            <div class="cd-sep">:</div>
            <div class="cd-cell"><b id="cd-h">--</b><span>horas</span></div>
            <div class="cd-sep">:</div>
            <div class="cd-cell"><b id="cd-m">--</b><span>minutos</span></div>
            <div class="cd-sep">:</div>
            <div class="cd-cell"><b id="cd-s">--</b><span>segundos</span></div>
          </div>
          <div class="euca tr" aria-hidden="true"></div>
        </div>
      </div>
```

> NOTE: there must be exactly ONE `#countdown` / `#cd-*` set in the document. This block is the canonical one (the old one lived in the Detalles slide that Task 4 replaced — confirm no duplicate IDs remain).

- [ ] **Step 2: Append countdown CSS**

```css
/* ===================== Countdown (slide) ===================== */
.cd-panel .sub{ font-size:clamp(26px,8vw,38px); margin:2px 0 30px; }
.countdown.big{ display:flex; align-items:flex-start; justify-content:center; gap:6px; }
.countdown.big .cd-cell{ display:flex; flex-direction:column; align-items:center; min-width:54px; }
.countdown.big .cd-cell b{ font-family:var(--serif); font-weight:500; color:var(--green-ink);
  font-size:clamp(36px,12vw,56px); line-height:1; }
.countdown.big .cd-cell span{ font-family:var(--sans); font-size:11px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--muted); margin-top:6px; }
.countdown.big .cd-sep{ font-family:var(--serif); color:var(--gold-soft);
  font-size:clamp(30px,10vw,46px); line-height:1; padding-top:2px; }
```

- [ ] **Step 3: Verify countdown**

Reload. Slide 5 (cream): "FALTA POCO PARA" / script "el gran día", then four large serif numbers separated by gold colons with labels DÍAS HORAS MINUTOS SEGUNDOS, ticking live (watch the seconds change). Verify at 390px the four cells fit on one row.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: slide Countdown dedicado (reusa countdown.js)"
```

---

### Task 7: Itinerario slide (new)

**Files:**
- Modify: `index.html` (insert after Countdown)
- Modify: `css/styles.css` (append timeline styles)
- Modify: `js/main.js` (render timeline from `config.itinerary`)

**Interfaces:**
- Consumes: `itinerary` (`{time,label,icon}[]`, icon ∈ `rings|camera|dinner|party`).
- Produces: ID `#itinerary-list`; JS helper `itinIcon(name)` returning an inline SVG string.

- [ ] **Step 1: Insert the Itinerario slide HTML**

Insert AFTER the Countdown slide:

```html
      <!-- 6 · Itinerario -->
      <div class="swiper-slide slide--sage">
        <div class="panel itinerary">
          <h2 class="serif-caps">Itinerario</h2>
          <ul class="itin-list" id="itinerary-list"></ul>
          <div class="euca bl" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append itinerary CSS**

```css
/* ===================== Itinerario ===================== */
.itinerary{ gap:18px; }
.itin-list{ list-style:none; margin:18px 0 0; padding:0; width:100%; max-width:340px;
  display:flex; flex-direction:column; gap:22px; }
.itin-item{ display:flex; align-items:center; gap:16px; text-align:left; }
.itin-ico{ flex:0 0 auto; width:42px; height:42px; display:grid; place-items:center; }
.itin-ico svg{ width:34px; height:34px; color:var(--on-sage); opacity:.95; }
.itin-time{ font-family:var(--serif); font-size:22px; color:var(--on-sage); line-height:1; }
.itin-label{ font-family:var(--sans); font-size:13px; letter-spacing:.06em; color:var(--on-sage); opacity:.85; margin-top:3px; }
```

- [ ] **Step 3: Render itinerary in main.js**

Add after the Detalles hydration block:

```js
  /* ---------- Itinerario ---------- */
  function itinIcon(name) {
    var s = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">';
    var paths = {
      rings:  '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M9 4l1.5 3M15 4l-1.5 3M12 2l-1.5 2.5h3L12 2z"/>',
      camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>',
      dinner: '<path d="M5 3v8a2 2 0 002 2v8M7 3v6M19 3c-1.5 1-2.5 3-2.5 6 0 2 1 2.5 2.5 2.5V21"/>',
      party:  '<path d="M3 21l6-14 8 8-14 6zM9 7l8 8M14 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"/>'
    };
    return s + (paths[name] || paths.rings) + '</svg>';
  }
  var itinList = $("#itinerary-list");
  if (itinList && cfg.itinerary) {
    itinList.innerHTML = cfg.itinerary.map(function (it) {
      return '<li class="itin-item">' +
        '<span class="itin-ico" aria-hidden="true">' + itinIcon(it.icon) + '</span>' +
        '<span><span class="itin-time">' + it.time + '</span>' +
        '<span class="itin-label">' + it.label + '</span></span></li>';
    }).join("");
  }
```

- [ ] **Step 4: Verify itinerario**

Reload. Slide 6 (sage): "ITINERARIO" then a vertical list — each row an icon + time (serif) + label: 5:00pm Ceremonia, 6:00pm ¡Fotos!, 8:00pm Cena, 9:00pm ¡Fiesta!. Icons render (no broken-SVG boxes). Verify at 390px.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: slide Itinerario (timeline desde config)"
```

---

### Task 8: Nuestra historia slide (new)

**Files:**
- Modify: `index.html` (insert after Itinerario)
- Modify: `css/styles.css` (append story styles)
- Modify: `js/main.js` (hydrate story)

**Interfaces:**
- Consumes: `story`, `storyImage`.
- Produces: IDs `#story-text`, `#story-img`.

- [ ] **Step 1: Insert the Historia slide HTML**

Insert AFTER the Itinerario slide:

```html
      <!-- 7 · Nuestra historia -->
      <div class="swiper-slide slide--cream">
        <div class="panel story">
          <h2 class="script gold story-title">Nuestra historia</h2>
          <div class="story-photo"><img id="story-img" src="" alt="Nuestra historia" loading="lazy" /></div>
          <p class="story-text" id="story-text"></p>
          <div class="euca tr" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append story CSS**

```css
/* ===================== Nuestra historia ===================== */
.story{ gap:18px; overflow-y:auto; }
.story-title{ font-size:clamp(36px,11vw,52px); margin:0; }
.story-photo{ width:min(72%,300px); aspect-ratio:3/2; overflow:hidden; border-radius:6px; box-shadow:var(--shadow); }
.story-photo img{ width:100%; height:100%; object-fit:cover; display:block; }
.story-text{ font-family:var(--serif); font-size:clamp(16px,4.6vw,20px); line-height:1.6;
  color:var(--ink); max-width:34ch; margin:0; }
```

- [ ] **Step 3: Hydrate story in main.js**

Add after the Itinerario block:

```js
  /* ---------- Nuestra historia ---------- */
  var storyImg = $("#story-img");
  if (storyImg && cfg.storyImage) storyImg.src = cfg.storyImage;
  var storyText = $("#story-text");
  if (storyText && cfg.story) storyText.textContent = cfg.story;
```

- [ ] **Step 4: Verify historia**

Reload. Slide 7 (cream): script "Nuestra historia", a landscape photo, the story paragraph (serif) from config. If text is long it scrolls vertically inside the slide without breaking horizontal flip. Verify at 390px.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: slide Nuestra historia (texto + foto desde config)"
```

---

### Task 9: Regalos slide (new)

**Files:**
- Modify: `index.html` (insert after Historia)
- Modify: `css/styles.css` (append gifts styles)
- Modify: `js/main.js` (hydrate gifts + wire button)

**Interfaces:**
- Consumes: `giftText`, `giftListUrl`.
- Produces: IDs `#gift-text`, `#btn-gifts`.

- [ ] **Step 1: Insert the Regalos slide HTML**

Insert AFTER the Historia slide:

```html
      <!-- 8 · Regalos -->
      <div class="swiper-slide slide--sage">
        <div class="panel gifts">
          <h2 class="serif-caps">Regalos</h2>
          <p class="gift-text" id="gift-text"></p>
          <a class="btn btn-light" id="btn-gifts" href="#" target="_blank" rel="noopener" hidden>Ver nuestra lista</a>
          <div class="euca bl" aria-hidden="true"></div>
        </div>
      </div>
```

- [ ] **Step 2: Append gifts CSS**

```css
/* ===================== Regalos ===================== */
.gifts{ gap:22px; }
.gift-text{ font-family:var(--serif); font-size:clamp(16px,4.6vw,20px); line-height:1.6;
  color:var(--on-sage); max-width:34ch; margin:14px 0 0; }
.btn-light{ background:var(--on-sage); color:var(--green-ink); text-decoration:none; }
```

- [ ] **Step 3: Hydrate gifts in main.js**

Add after the Historia block:

```js
  /* ---------- Regalos ---------- */
  var giftText = $("#gift-text");
  if (giftText && cfg.giftText) giftText.textContent = cfg.giftText;
  var giftBtn = $("#btn-gifts");
  if (giftBtn && cfg.giftListUrl) {
    giftBtn.href = cfg.giftListUrl;
    giftBtn.hidden = false;
  }
```

> The button is `hidden` by default; it only appears when `giftListUrl` is non-empty.

- [ ] **Step 4: Verify regalos**

Reload. Slide 8 (sage): "REGALOS", the gift paragraph (cream). With `giftListUrl:""` the button is hidden. Temporarily set `giftListUrl` to `"https://example.com"` in config, reload → "Ver nuestra lista" appears and opens the URL in a new tab; then revert to `""`. Verify at 390px.

- [ ] **Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: slide Regalos (mensaje + botón lista condicional)"
```

---

### Task 10: RSVP slide re-skin

**Files:**
- Modify: `index.html` (the existing `<!-- 5 · RSVP -->` panel — add band class, eucalyptus; keep IDs)
- Modify: `css/styles.css` (adjust `.confirm` styles to new palette)

**Interfaces:**
- Consumes: nothing new. Keeps `#btn-rsvp` (opens RSVP modal via existing handler) and all `.confirm` inner structure.
- Produces: no new IDs.

- [ ] **Step 1: Add band + eucalyptus to RSVP slide**

In `index.html`, change the RSVP slide opening tag from `<div class="swiper-slide">` to `<div class="swiper-slide slide--cream">`, and add a eucalyptus corner just before the closing `</div>` of the `.panel.confirm`:

```html
          <button class="btn btn-primary" id="btn-rsvp" type="button">Confirmar asistencia</button>
          <div class="euca tr" aria-hidden="true"></div>
        </div>
```

Also update the slide comment number to `<!-- 9 · RSVP -->`.

- [ ] **Step 2: Verify the `.confirm` CSS uses tokens**

Search `css/styles.css` for the `.confirm`, `.names`, `.con-carino`, `.confirm-title`, `.btn-primary`, `.heart-rule`, `.thanks`, `.deadline` rules. Ensure colors reference tokens (`var(--green-ink)`, `var(--gold)`, `var(--sage)`, `var(--muted)`) rather than hard-coded old hexes. If any rule hard-codes the old gold `#b1924f` or cream `#f4f1e9`, replace with the token. Add this normalization block at the end of `css/styles.css` to guarantee the new palette on this slide:

```css
/* ===================== RSVP slide palette normalize ===================== */
.confirm .names{ color:var(--green-ink); }
.confirm .con-carino, .confirm .confirm-sub, .confirm .c-ico, .confirm .hrt{ color:var(--gold); }
.confirm .thanks, .confirm .deadline, .confirm .c-num{ color:var(--muted); }
.confirm .confirm-title{ color:var(--green-ink); }
.btn-primary{ background:var(--sage); color:var(--on-sage); border:none; }
```

- [ ] **Step 3: Verify RSVP slide + modal**

Reload, swipe to the RSVP slide (cream): envelope icon, "Con cariño", "JAMIL & GABRIELA", heart rule, thanks, "CONFIRMA TU asistencia", deadline, "Confirmar asistencia" button, eucalyptus corner — all in sage/gold/green palette. Click the button → RSVP modal opens; fill it and submit → WhatsApp opens with the prefilled message (existing behavior). Verify at 390px.

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "feat: re-skin slide RSVP a paleta sage/crema"
```

---

### Task 11: Gallery + Video re-skin and ordering

**Files:**
- Modify: `js/main.js` (gallery/video injected slides: add band classes + eucalyptus; update petal color)
- Modify: `css/styles.css` (re-skin `.panel`, `.grid`, `.vpanel`, lightbox, video modal, music button)

**Interfaces:**
- Consumes: existing `galleryList`, `cfg.videoUrl`, `cfg.gallery`.
- Produces: gallery slide gets `slide--sage`, video slide gets `slide--cream`. These are appended last (after the static slides), preserving final order.

- [ ] **Step 1: Update gallery slide markup in main.js**

In `js/main.js`, in the gallery-building block, change `gslide.className = "swiper-slide";` to:

```js
    gslide.className = "swiper-slide slide--sage";
```

and update the gallery `innerHTML` to drop the old "Nuestra historia" eyebrow (now its own slide) and add a eucalyptus corner:

```js
    gslide.innerHTML =
      '<div class="panel gallery-panel">' +
        '<h2 class="serif-caps">Galería</h2>' +
        '<div class="grid" id="grid">' + thumbs + '</div>' +
        '<button class="btn" id="btn-gallery-all" type="button">Ver todas las fotos</button>' +
        '<div class="euca br" aria-hidden="true"></div>' +
      '</div>';
```

- [ ] **Step 2: Update video slide markup in main.js**

Change `vslide.className = "swiper-slide";` to:

```js
    vslide.className = "swiper-slide slide--cream";
```

- [ ] **Step 3: Update petal stroke color in main.js**

In `startPetals()`, the inline leaf SVG uses `stroke="%23b1924f"`. Change it to the new gold:

```js
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C7 7 4 11 4 16a8 8 0 0016 0c0-5-3-9-8-14z" fill="none" stroke="%23b3925a" stroke-width="1.2"/></svg>'
```

- [ ] **Step 4: Append gallery/video re-skin CSS**

```css
/* ===================== Galería / Video (re-skin) ===================== */
.gallery-panel h2{ color:var(--on-sage); margin-bottom:18px; }
.grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; width:100%; max-width:360px; }
.grid img{ width:100%; aspect-ratio:1; object-fit:cover; border-radius:4px; cursor:pointer; }
.gallery-panel .btn{ margin-top:18px; background:var(--on-sage); color:var(--green-ink); }
.vpanel{ background:#000; }
.vtitle{ font-family:var(--serif); color:var(--green-ink); }
```

> If existing `.grid` / `.vpanel` / lightbox / `.music-btn` rules already define these, this block only adjusts colors — keep the existing layout rules and let these override palette. If a rule hard-codes old `#b1924f`/`#f4f1e9`, replace with tokens.

- [ ] **Step 5: Verify gallery + video**

Reload. Swipe to the Galería slide (sage): 6 thumbnails grid + "Ver todas las fotos"; tap a photo → lightbox opens, prev/next/close work. Petals are the new gold tone. To test video: set `videoUrl` in config to a YouTube link, reload → a Video slide (cream) appears last; tap → modal plays; then revert `videoUrl` to `""`. Verify the deck has 10 slides (11 with video). Verify at 390px.

- [ ] **Step 6: Commit**

```bash
git add js/main.js css/styles.css
git commit -m "feat: re-skin Galería/Video, bandas y color de pétalos"
```

---

### Task 12: Intro / progress re-skin + final pass

**Files:**
- Modify: `css/styles.css` (intro envelope, seal, progress bars, hint, tap-zones — palette to tokens)
- Modify: `index.html` (intro subtitle text if needed)
- Modify: `js/main.js` (none expected; verify deep-link still works)

**Interfaces:**
- Consumes: existing intro/progress structure.
- Produces: final themed, fully-working deck.

- [ ] **Step 1: Normalize intro/progress/hint palette**

Append to `css/styles.css`:

```css
/* ===================== Intro / progress / hint (re-skin) ===================== */
.intro{ background:var(--cream); }
.intro-names{ font-family:var(--script); color:var(--gold); }
.intro-sub{ font-family:var(--sans); color:var(--muted); letter-spacing:.14em; }
.env-flap, .env-body{ background:var(--cream-2); border-color:var(--gold-soft); }
.env-seal{ background:var(--sage); color:var(--on-sage); }
.intro-open{ background:var(--sage); color:var(--on-sage); border:none; }
.progress .seg i{ background:var(--gold-soft); }
.progress .seg.done i, .progress .seg.active i{ background:var(--gold); }
.hint{ color:var(--muted); }
.hint-chev{ color:var(--gold); }
```

> If existing rules already style these, these overrides only swap colors to the new tokens. Replace any remaining hard-coded `#b1924f`/`#f4f1e9` in those existing rules with `var(--gold)`/`var(--cream)`.

- [ ] **Step 2: Update intro subtitle (optional copy)**

In `index.html`, the intro shows `<p class="intro-sub">Nos casamos · 01.08.2026</p>` — leave as is (already correct).

- [ ] **Step 3: Full end-to-end verification**

Run `python3 serve.py`. With a hard refresh (Cmd+Shift+R):
1. Intro envelope shows cream/sage/gold palette; "Abrir invitación" works; petals fall (gold).
2. Swipe through ALL slides in order: Portada → Mensaje → Celebra → Dress code → Countdown → Itinerario → Historia → Regalos → RSVP → Galería (→ Video if configured). Bands alternate cream/sage. Eucalyptus corners present.
3. Story progress bars at top advance per slide (count matches slide count).
4. Tap-zone navigation: tap right third → next, left third → prev. Tapping buttons/grid does NOT navigate.
5. Countdown ticks. "Ver mapa" opens maps. "Agendar" downloads .ics. RSVP opens modal → WhatsApp. Gallery lightbox works.
6. Deep-links: `http://localhost:8123/?s=8` opens near RSVP; `?s=8&rsvp=1` opens the RSVP modal.
7. No console errors. Check at 390px width.

- [ ] **Step 4: Update CLAUDE.md slide list**

In `CLAUDE.md`, update the "### Slides (orden actual)" section to reflect the new 11-slide order (Portada, Mensaje, Celebra con nosotros, Dress code, Countdown, Itinerario, Nuestra historia, Regalos, RSVP, Galería, Video) and note slides 1–8 are now HTML. Mark the relevant backlog/progress items.

- [ ] **Step 5: Commit**

```bash
git add css/styles.css index.html CLAUDE.md
git commit -m "feat: re-skin intro/progress/hint + verificación final + actualizar CLAUDE.md"
```

---

## Self-Review

**Spec coverage:**
- Tokens/palette → Task 1 ✓
- Bands cream/sage + eucalyptus → Task 1 (base) + every slide task ✓
- Fonts unchanged → Global Constraints ✓ (no font changes in any task)
- Slides 1–4 image→HTML → Tasks 2,3,4,5 ✓
- Countdown own slide → Task 6 ✓ (single `#countdown`, reuses countdown.js)
- Itinerario / Historia / Regalos new → Tasks 7,8,9 ✓
- RSVP re-skin, WhatsApp intact → Task 10 ✓
- Gallery + Video kept/re-skinned, placed last → Task 11 ✓
- Intro/petals/progress re-skin → Task 12 ✓
- New config fields → Task 1 ✓
- giftListUrl empty hides button → Task 9 ✓
- Deep-links still work → Task 12 verification ✓
- main.js hydration per section (fill* pattern) → Tasks 2–9 ✓

**Placeholder scan:** Config TODOs (real time/address/gift URL/photos) are intentional user-pending values, explicitly flagged in spec + Global Constraints — not plan gaps. Every code step shows complete code. No "TBD"/"similar to"/"add error handling" placeholders.

**Type/ID consistency:** Reused IDs kept exactly: `#countdown`, `#cd-d/h/m/s` (Task 6 ↔ countdown.js), `#btn-map`, `#btn-cal`, `#btn-rsvp` (Tasks 4/10 ↔ main.js handlers), `#grid`, `#btn-gallery-all` (Task 11 ↔ existing lightbox handler). New IDs (`#hero-img`, `#msg-text`, `#detail-address`, `#itinerary-list`, `#story-text`, `#gift-text`, `#btn-gifts`, etc.) are each defined in HTML and consumed in the same task's main.js step. `itinIcon()` defined and used in Task 7.
