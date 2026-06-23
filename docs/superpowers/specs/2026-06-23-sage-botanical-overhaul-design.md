# Diseño: Refactor visual "Sage Botanical" — Invitación Jamil & Gaby

**Fecha:** 2026-06-23
**Estado:** Aprobado el enfoque; pendiente revisión del spec por el usuario.

## Objetivo

Rediseño visual completo ("full visual overhaul") de la invitación de boda para
adoptar el estilo del nuevo diseño de Canva (paleta sage/crema, botánicos de
eucalipto en acuarela, tipografía serif + script), **manteniendo el mecanismo
de navegación actual** (deck horizontal estilo "stories" con flip de Swiper) y
toda la funcionalidad existente (RSVP por WhatsApp, countdown, mapa/.ics,
galería, video, intro de sobre, pétalos, navegación por tap).

El diseño de Canva es una página de scroll vertical con bandas alternadas
crema/verde. Reproducimos esa **estética por slide** (no el scroll): cada slide
toma fondo crema o sage alternado, con esquinas de eucalipto en acuarela.

## Decisiones tomadas (confirmadas o asumidas)

- **Navegación:** se conserva el deck flip de Swiper (horizontal, tap-nav). NO
  se cambia a scroll vertical.
- **Contenido:** se incluyen TODAS las secciones nuevas del Canva (Itinerario,
  Nuestra historia, Regalos) y se conservan Galería y Video.
- **Tipografía:** se mantiene el stack actual de Google Fonts (Cormorant
  Garamond + Great Vibes + Jost). Es un match muy cercano al Canva y evita
  licenciamiento de fuentes propietarias.
- **Slides 1–4 hoy son imágenes del PDF.** Se reconstruyen como **HTML temático**
  (igual que el slide RSVP actual) para poder aplicar la nueva paleta. Las
  imágenes `assets/pages/page1–4` dejan de usarse como slides completos.
- **Datos pendientes** (se cablean como campos de `config.js` con valores por
  defecto del Canva; el usuario los completa luego):
  - Hora real (Canva muestra recepción 4:00pm e Itinerario Ceremonia 5:00pm,
    pero `config.dateISO` actual es 16:30). **El countdown sigue usando el
    `dateISO` actual (16:30)** hasta que el usuario confirme. Marcado como TODO
    en config.
  - Dirección real del lugar (`addressLines`) — el texto del Canva es
    parcialmente ilegible; default provisional.
  - URL de la lista de regalos (`giftListUrl`) — vacío ⇒ se oculta el botón.
  - Fotos específicas del Canva (fachada del lugar, pareja, aérea "La pedida").
    No se tienen como assets. Se cablean campos `heroImage`, `messageImage`,
    `storyImage` con defaults tomados de `assets/gallery/` y/o `og-image.jpg`;
    el usuario reemplaza por las fotos reales.

## Sistema de diseño (tokens)

Reemplazan los tokens actuales en `css/styles.css` (`:root`):

| Token | Valor nuevo | Uso |
|---|---|---|
| `--cream` | `#efece2` | fondo crema (slides impares) |
| `--cream-2` | `#e7e2d4` | crema secundario / tarjetas |
| `--sage` | `#868f74` | verde sage (slides pares, botones) |
| `--sage-deep` | `#6f775d` | hover/sombra del sage |
| `--green-ink` | `#525a43` | texto sobre crema (títulos) |
| `--on-sage` | `#f4f1e9` | texto crema sobre sage |
| `--gold` | `#b3925a` | íconos, hairlines, detalles |
| `--ink` | `#2c2a24` | texto base |
| `--muted` | `#8a8575` | texto secundario |

Tipografía sin cambios: `--serif` Cormorant, `--script` Great Vibes, `--sans` Jost.

**Botánicos:** overlays PNG de eucalipto en acuarela en esquinas de los slides
(nuevos assets en `assets/botanical/`: p.ej. `eucalyptus-corner.png` y variante
espejada). Se posicionan absolute, `pointer-events:none`, opacidad ~0.9. Se
generan/recortan de recursos libres o se exportan del Canva si el usuario los
provee. Default: 1–2 PNGs reutilizados con rotación/espejo por CSS.

**Ritmo de bandas:** un modificador por slide (`.slide--cream` / `.slide--sage`)
controla fondo y color de texto, alternando para imitar el Canva.

## Slides (orden final, todos HTML salvo Galería/Video)

| # | Slide | Banda | Contenido |
|---|---|---|---|
| 1 | Portada | crema | foto del lugar (`heroImage`), "Jamil & Gaby", "01 · 08 · 2026", botón "¡Nos casamos!", hint de swipe |
| 2 | Mensaje | sage | foto pareja (`messageImage`) + texto de bienvenida (config) |
| 3 | Celebra con nosotros | crema | "Ceremonia civil & Recepción"; ícono fecha+hora · dirección · botón "Ver mapa" (reusa lógica de mapa) |
| 4 | Dress code | sage | "Elegancia moderna"; columnas Mujeres / Hombres (íconos línea) + fila de swatches pastel |
| 5 | Countdown | crema | "Falta poco para el gran día" + countdown en vivo (reusa `countdown.js`) |
| 6 | Itinerario *(nuevo)* | sage | timeline desde `config.itinerary`: 5:00 Ceremonia · 6:00 Fotos · 8:00 Cena · 9:00 ¡Fiesta! con íconos de línea |
| 7 | Nuestra historia *(nuevo)* | crema | título script "Nuestra historia" + `config.story` + foto (`storyImage`) |
| 8 | Regalos *(nuevo)* | sage | mensaje (`config.giftText`) + botón "Ver nuestra lista" → `config.giftListUrl` (oculto si vacío) |
| 9 | RSVP | crema | tarjeta estilo Canva; conserva flujo WhatsApp (`rsvp.js`) y modal |
| 10 | Galería | sage | grid 6 + lightbox 14 (reestilizado) |
| 11 | Video | crema | condicional a `config.videoUrl` (reestilizado) |

Indicadores de progreso, tap-zones, intro de sobre y pétalos se conservan y se
reestilizan a la nueva paleta.

## Nuevos campos en `js/config.js`

```js
displayNames: "Jamil & Gaby",          // hero (resto del sitio puede seguir "Jamil & Gabriela")
heroImage:    "assets/gallery/g01.jpg", // TODO: foto real del lugar
messageImage: "assets/gallery/g05.jpg", // TODO: foto real de la pareja
storyImage:   "assets/gallery/g10.jpg", // TODO: foto real "La pedida"
addressLines: ["La Puntilla, Samborondón", "Av. Principal, calle cuarta sur"], // TODO: confirmar
welcomeText:  "Después de tantos momentos, risas y sueños compartidos, ha llegado el día que siempre imaginamos. Nos llena de felicidad invitarte a celebrar el inicio de nuestra nueva historia.",
itinerary: [
  { time: "5:00pm", label: "Ceremonia", icon: "rings" },
  { time: "6:00pm", label: "¡Fotos!",   icon: "camera" },
  { time: "8:00pm", label: "Cena",      icon: "dinner" },
  { time: "9:00pm", label: "¡Fiesta!",  icon: "party" }
],
story: "Hay encuentros que parecen escritos por el destino. El nuestro comenzó como una amistad inesperada y creció entre conversaciones, sueños compartidos y la certeza de que juntos todo es posible. Cinco años después seguimos eligiéndonos cada día y estamos listos para comenzar la aventura más importante de nuestras vidas.",
giftText: "Desde el inicio de nuestra historia hemos compartido sueños, metas y proyectos que nos ilusionan profundamente. Si desean acompañarnos también en esta nueva etapa, hemos preparado una lista con algunos detalles que nos ayudarán a construir nuestro hogar y seguir creando recuerdos juntos.",
giftListUrl: ""                          // vacío ⇒ oculta el botón
```

Los campos existentes (`dateISO`, `mapLat/Lng`, `whatsappNumber`, `gallery`,
etc.) se conservan sin cambios.

## Arquitectura / archivos a tocar

- `index.html` — reconstruir el `swiper-wrapper`: slides 1–4 pasan de `<img>` a
  HTML temático; añadir slides Countdown, Itinerario, Nuestra historia, Regalos.
  Reestilizar slide RSVP. Actualizar `theme-color` y títulos OG si aplica.
- `css/styles.css` — nuevos tokens; estilos de bandas crema/sage; layouts de los
  slides nuevos (detalles, dress code con swatches, timeline de itinerario,
  historia, regalos); overlays botánicos; re-skin de intro/petalos/progress/
  modales/lightbox/galería.
- `js/config.js` — añadir campos nuevos (arriba).
- `js/main.js` — poblar los slides HTML desde config (nombres, fotos, dirección,
  itinerario, historia, regalos, botón "Ver nuestra lista"/"Ver mapa"); la
  galería y video ya se insertan por JS — ajustar inserción/orden si hace falta.
- `js/countdown.js` — sin cambios de lógica; el countdown ahora vive en su slide.
- `js/rsvp.js` — sin cambios de lógica (flujo WhatsApp + modal).
- `assets/botanical/` — nuevos PNG de eucalipto (overlays).

## Aislamiento y límites

- **config.js** sigue siendo la única fuente de datos editable.
- **main.js** hidrata el DOM desde config (una función por sección, p.ej.
  `fillDetails()`, `fillItinerary()`, `fillStory()`, `fillGifts()`), para que
  cada sección sea comprensible y editable de forma independiente.
- **styles.css** organiza por secciones con comentarios de encabezado, igual que
  hoy. El modificador de banda (`.slide--cream/--sage`) desacopla tema de layout.
- Lógica de countdown/rsvp/mapa/.ics intacta y reutilizada — sin reescritura.

## Manejo de errores / casos borde

- `giftListUrl` vacío ⇒ ocultar botón Regalos (no romper el slide).
- `videoUrl` vacío ⇒ slide Video no se inserta (comportamiento actual).
- Fotos faltantes ⇒ usar defaults de galería; `onerror` cae a color sólido sage.
- Botánicos como overlay decorativo `aria-hidden`; no deben capturar taps
  (`pointer-events:none`) para no romper la navegación por tap-zone.
- Texto largo (historia/regalos) ⇒ slide con scroll interno vertical si excede
  alto, sin romper el flip horizontal.

## Pruebas / verificación

Sitio estático sin framework ⇒ verificación manual con `serve.py`:

1. `python3 serve.py` → abrir `http://localhost:8123`.
2. Recorrer los 11 slides con swipe y con tap-zones; verificar alternancia
   crema/sage y botánicos en esquinas.
3. Countdown corre; "Ver mapa" abre coords; "Agendar" descarga .ics.
4. RSVP abre modal y arma mensaje de WhatsApp correcto.
5. Itinerario, Historia y Regalos muestran datos de config; botón Regalos se
   oculta con `giftListUrl` vacío.
6. Galería + lightbox y Video (con/sin `videoUrl`) funcionan.
7. Deep-links `?s=N` y `?s=N&rsvp=1` siguen funcionando (ajustar índices).
8. Móvil real vía iframe 390px (no headless por el recorte conocido).

## Fuera de alcance (YAGNI)

- No se cambia a scroll vertical (decisión del usuario).
- No se cambian fuentes a las propietarias del Canva.
- No PWA, multi-idioma, Google Sheet RSVP, ni mapa embebido (siguen en backlog).
- No se recortan las fotos del composite de Canva (baja resolución); se usan
  fotos reales vía config.

## Pendientes que el usuario debe completar luego (config)

1. Hora correcta de ceremonia/recepción (y ajustar `dateISO` si aplica).
2. Dirección real (`addressLines`).
3. URL de lista de regalos (`giftListUrl`).
4. Fotos reales para hero / mensaje / historia.
