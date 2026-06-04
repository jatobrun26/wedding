# Invitación de boda — Jamil & Gabriela 💍

Web app interactiva (estilo "stories" con transición de página) hecha a partir del PDF
de la invitación. Estática, sin servidor, **se publica gratis en GitHub Pages**.

---

## 📁 Qué se publica y qué NO

Se publica (ligero, ~1 MB):

```
index.html
css/        js/        assets/pages   assets/gallery   assets/favicon.svg   assets/og-image.jpg
.nojekyll
```

**NO** se publica (lo bloquea `.gitignore` porque pesa demasiado para GitHub Pages):
`video/` (7.4 GB), `fotos/` (359 MB) y `J (1).pdf`. Las fotos ya están optimizadas
dentro de `assets/gallery/`. El video va por YouTube/Vimeo (ver abajo).

---

## ✅ Antes de publicar — completa `js/config.js`

Es el **único** archivo que necesitas editar. Tres cosas opcionales:

1. **RSVP (confirmaciones) → `rsvpEndpoint`**
   Sigue los pasos de `apps-script-rsvp.gs` (5 min) y pega la URL `/exec`.
   Mientras esté vacío, el formulario funciona pero solo muestra "¡Gracias!" sin guardar.

2. **Video → `videoUrl`**
   Sube tu reel a YouTube o Vimeo como **"no listado"** y pega el enlace normal, p. ej.
   `https://youtu.be/XXXXXXXX`. Aparecerá una diapositiva de video con botón de play.
   Déjalo vacío para ocultarlo.

3. **Música → `musicSrc`** (opcional)
   Coloca un `.mp3` (música libre de derechos) en `assets/music/` y pon el nombre,
   p. ej. `"assets/music/cancion.mp3"`. Aparecerá un botón de música arriba a la derecha.

---

## 🚀 Publicar en GitHub Pages (gratis)

1. Crea una cuenta en https://github.com (si no tienes) y un repositorio **público**,
   por ejemplo `boda`.
2. Sube los archivos. Desde esta carpeta:
   ```bash
   cd "/Users/jamiltorres/Documents/utils"
   git init
   git add .
   git commit -m "Invitación de boda"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/boda.git
   git push -u origin main
   ```
   > El `.gitignore` ya excluye los videos, fotos originales y el PDF.
3. En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`** → Save.
4. En 1–2 min estará en vivo en:
   **`https://TU_USUARIO.github.io/boda/`** (con HTTPS, gratis).

Para actualizar algo: edita, luego `git add . && git commit -m "cambio" && git push`.

---

## 🔗 Tips

- **Vista previa local:** `python3 -m http.server 8000` y abre `http://localhost:8000`.
- **Saltar el intro / enlace directo:** agrega `?s=2` a la URL para abrir en una
  diapositiva concreta (útil para probar). `?s=4&rsvp=1` abre el formulario RSVP.
- **Compartir bonito:** al pegar el enlace en WhatsApp/iMessage se ve la portada
  (definido en las etiquetas Open Graph de `index.html`).
- **QR para tarjetas impresas:** genera un QR que apunte a tu URL de GitHub Pages
  (p. ej. en https://www.qr-code-generator.com) para reemplazar el QR del PDF.
- **Dominio propio (después, ~$10/año):** compra un dominio, agrega un archivo `CNAME`
  con el dominio y configura el DNS; actívalo en Settings → Pages.

---

## 🛠️ Cómo se generaron las imágenes (referencia)

```bash
# Páginas del PDF → WebP + JPG (con poppler + webp instalados vía Homebrew)
pdftoppm -r 150 -png "J (1).pdf" page
# luego sips -Z 2000 + cwebp -q 82  → assets/pages/

# Fotos de compromiso → 14 seleccionadas, 1600px, WebP+JPG → assets/gallery/
```
