# CLAUDE.md — Invitación de boda Jamil & Gabriela

Web app interactiva de invitación de boda, generada a partir de un PDF de 5 páginas.
Estática (sin backend), pensada para publicarse **gratis** en GitHub Pages.

## Datos clave de la boda
- **Pareja:** Jamil & Gabriela
- **Evento:** Boda Civil — **Sábado 01 de agosto del 2026, 16:30** (recepción)
- **Lugar:** Samborondón, Ecuador — pin exacto: `-2.157539, -79.865478`
- **RSVP:** por **WhatsApp** al **+593 93 949 8845** (decodificado del QR original del PDF)
- **Fecha límite RSVP:** 15 de julio del 2026
- **Idioma:** español · **Dress code:** Formal Elegante
- **Paleta/estilo:** crema `#f4f1e9`, dorado `#b1924f`, tinta `#211f1b`; serif (Cormorant
  Garamond) + script (Great Vibes) + sans (Jost). Hojas botánicas doradas.

## Arquitectura
Sitio estático, sin build, sin framework. Una sola página tipo "stories" con transición
**flip** (Swiper.js desde CDN). El resto es CSS + JS vanilla.

```
index.html              # estructura: intro (sobre), deck de slides, modales
css/styles.css          # tema, slides a pantalla completa, animaciones
js/config.js            # ÚNICO archivo a editar para cambiar datos (ver abajo)
js/main.js              # Swiper, intro, pétalos, navegación por tap, mapa/.ics, galería, video, música
js/countdown.js         # cuenta regresiva en vivo
js/rsvp.js              # formulario RSVP → abre WhatsApp con mensaje prellenado
assets/pages/           # páginas 1–4 del PDF como WebP+JPG (la 5 ahora es HTML)
assets/gallery/         # 14 fotos de compromiso curadas (WebP+JPG)
assets/og-image.jpg     # preview para WhatsApp/iMessage
assets/favicon.svg
apps-script-rsvp.gs     # (alternativa) RSVP a Google Sheet, NO usado actualmente
README_DEPLOY.md        # guía de publicación
serve.py                # servidor local con headers no-cache (NO se despliega, está en .gitignore)
```

### Slides (orden actual — 11 slides, todos HTML excepto assets)
1. Portada + hint "Desliza para continuar ›"
2. Mensaje
3. Celebra con nosotros (Ceremonia civil & Recepción)
4. Dress code
5. Countdown (cuenta regresiva en vivo)
6. Itinerario (anillo, cóctel, cena, fiesta con horarios)
7. Nuestra historia (foto + texto personal)
8. Regalos (texto + link opcional a lista)
9. RSVP (HTML en vivo: orden "nombres primero", sin QR ni hoja)
10. Galería (grid de 6 + lightbox con las 14)
11. Video (solo aparece si `videoUrl` está configurado)

## Editar los datos
Todo en **`js/config.js`**. Campos importantes:
- `dateISO` (countdown), `calStartISO`/`calEndISO` (.ics = 16:00 → 00:00)
- `mapLat`/`mapLng` (pin exacto), `mapQuery` (respaldo)
- `whatsappNumber` (RSVP), `rsvpDeadlineText`
- `videoUrl` (YouTube/Vimeo, vacío = oculto), `musicSrc` (.mp3 en assets/music/, vacío = oculto)
- `gallery` (lista de nombres de archivo en assets/gallery/)

## Correr localmente
```bash
cd "/Users/jamiltorres/Documents/utils"
python3 serve.py            # http://localhost:8123  (headers no-cache)
```
Atajos de previsualización (deep-links): `?s=N` abre directo en una slide
(0=portada … 4=RSVP); `?s=4&rsvp=1` abre el formulario RSVP.

## Publicar (gratis)
GitHub Pages — pasos completos en `README_DEPLOY.md`. Resumen:
crear repo público → `git push` → Settings → Pages → branch `main` / root.
`.gitignore` excluye `video/` (7.4 GB), `fotos/` (originales), `*.pdf` y `serve.py`.
Vista previa temporal actual vía **ngrok** (URL cambia al reiniciar; requiere Mac encendido).

## Cómo se generaron los assets (referencia)
Herramientas (Homebrew): `poppler` (pdftoppm), `webp` (cwebp), `zbar` (zbarimg), `Pillow` (pip).
- Páginas: `pdftoppm -r 150 -png` → `sips -Z 2000` → `cwebp -q 82` + JPG.
- Galería: 14 fotos espaciadas de 54, `sips -Z 1600` → WebP/JPG.
- Página 5: QR decodificado con zbar; luego reconstruida como HTML.

## Estado / progreso
- [x] Conversión del PDF a imágenes optimizadas (11 MB → ~0.2 MB en WebP)
- [x] Experiencia stories + flip, intro de sobre, pétalos, progreso, navegación por tap
- [x] Countdown, "Cómo llegar" (coords exactas), "Agendar" (.ics 16:00–00:00)
- [x] RSVP por WhatsApp con mensaje prellenado
- [x] Galería (14 fotos) + lightbox
- [x] Página 5 reconstruida en HTML (orden "nombres primero", sin QR ni hoja)
- [x] Hint de portada horizontal y visible (pill + safe-area)
- [x] Servidor local no-cache + vista previa por ngrok
- [ ] **Video:** subir reel a YouTube/Vimeo (no listado) y poner `videoUrl`
- [ ] **Música:** opcional, .mp3 en assets/music/ + `musicSrc`
- [ ] **Deploy final a GitHub Pages** (URL permanente para enviar a invitados)
- [ ] **QR impreso:** generar QR nuevo que apunte a la URL final (el del PDF apunta a WhatsApp)

## Ideas de mejora (backlog)
1. **Intro de sobre más rica:** sello de cera con animación al abrir, sonido sutil opcional.
2. **Galería:** scroll infinito o álbum por momentos; usar `srcset` para servir tamaños según pantalla.
3. **Compartir:** botón "Compartir invitación" (Web Share API) + QR generado en el cliente.
4. **Add-to-calendar mejorado:** además del .ics, enlace directo a Google Calendar.
5. **Mapa embebido** (iframe) en lugar de solo abrir Google Maps, con indicaciones.
6. **Confirmaciones centralizadas:** además de WhatsApp, opción Google Sheet (apps-script-rsvp.gs)
   para tener una lista consolidada de asistentes.
7. **Cuenta regresiva con "celebración"** al llegar a 0 (confetti dorado).
8. **Accesibilidad:** foco visible en modales, `aria-live` ya en countdown; revisar lectores de pantalla.
9. **Multi-idioma** (ES/EN) si hay invitados extranjeros.
10. **Sección "Cómo llegar / Hospedaje"** con tips para invitados de fuera.
11. **PWA:** manifest + service worker para que se pueda "instalar" y abrir offline.
12. **Analítica simple y privada** (p. ej. conteo de aperturas) si se desea.

## Notas / gotchas
- **Caché:** usar `serve.py` (no-cache) durante desarrollo; en el navegador hacer hard refresh
  (Cmd+Shift+R) si algo se ve viejo.
- **Headless screenshots:** Chrome headless tiene ancho mínimo ~500px; capturas a 390/414
  recortan la derecha (es artefacto, no bug). Para verificar móvil real usar iframe a 390px.
- **QR del PDF:** está "quemado" en la imagen; no se puede editar. Por eso la página 5 se
  reconstruyó en HTML y el RSVP usa el botón → WhatsApp.
- **Tamaño de despliegue:** ~8 MB (la galería es lazy-load). Videos y fotos originales NO se suben.
```
