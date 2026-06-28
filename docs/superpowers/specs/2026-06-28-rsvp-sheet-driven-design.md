# RSVP mejorado: lista de invitados desde la hoja + cupo por nombre

**Fecha:** 2026-06-28
**Ámbito:** `apps-script-gifts.gs`, `index.html`, `js/rsvp.js`, `js/main.js`

## Objetivo

Mejorar el flujo de "Confirma tu asistencia":

1. El invitado **elige su nombre** de una lista (no lo escribe).
2. La lista de nombres y su **cupo máximo** vienen de una nueva pestaña **`invitados`**
   en la misma hoja de Google que ya usa el sitio.
3. Si elige **"Sí, asistiré"** aparece "Número de invitados (incluyéndote)" con
   **máximo = cupos** de ese nombre.
4. Si elige **"No podré asistir"**, el número de invitados es **0** y el campo nunca aparece.
5. Revertir el cambio anterior que ocultaba la pantalla de intro ("Abrir invitación").

## Decisiones (acordadas con el usuario)

- **Origen de datos:** en vivo desde la hoja (no hardcodeado en `config.js`).
- **Significado de `cupos`:** número total de asientos **incluyendo a la persona**
  (p. ej. `2` = la persona + 1 acompañante). El campo de invitados topa en `cupos`.
- **Al enviar:** registrar en la hoja **y** abrir WhatsApp (comportamiento actual).
- **Intro:** traer de vuelta la pantalla del sobre / "Abrir invitación".

## Diseño

### 1. Apps Script — acción `invitados`

En `apps-script-gifts.gs`, agregar al router `doGet`:

```
?action=invitados  → { ok:true, invitados:[{ name, cupos }, …] }   (JSONP vía ?callback=)
```

- Lee la pestaña `invitados` (constante `INVITADOS_SHEET = "invitados"`).
- Detecta columnas por la fila de encabezado: la columna cuyo encabezado contiene
  "nombre"/"invitad" → `name`; la que contiene "cupo" → `cupos`.
  Respaldo si no hay encabezados reconocibles: A = nombre, B = cupos.
- `cupos` se parsea a entero; si falta o es inválido, default `1`.
- Omite filas sin nombre y la fila de encabezado.

El usuario **redespliega una vez** (Administrar implementaciones → nueva versión)
para publicar la acción. Editar la pestaña después no requiere redeploy.

### 2. Formulario RSVP — `index.html` + `js/rsvp.js`

- El input de texto *Nombre* se reemplaza por un `<select id="rsvp-nombre">` nativo
  (sin dependencias, buen soporte móvil). Se conserva un input de texto oculto como
  **respaldo** (`rsvp-nombre-fallback`).
- Al abrir el modal: el select muestra "Cargando…", se hace fetch JSONP a
  `giftEndpoint?action=invitados`, y se llenan las opciones. Cada `<option>` lleva
  `data-cupos`.
- **Respaldo:** si el fetch falla, está vacío, o no hay `giftEndpoint`, se oculta el
  select y se muestra el input de texto libre — el RSVP nunca se rompe.
- Radios *¿Asistirás?*:
  - **Sí, asistiré** → el campo "Número de invitados (incluyéndote)" se muestra,
    `min=1`, `max=cupos` del nombre elegido, valor por defecto 1. Si `cupos<=1`,
    el campo queda fijo en 1.
  - **No podré asistir** → el campo se oculta y el valor se fuerza a `0`.
- Cambiar el nombre seleccionado reaplica el `max` y recorta el valor actual si excede.
- Al enviar: se mantienen ambos canales (hoja vía JSONP + WhatsApp). Se conserva la
  lógica del turno anterior (mensaje de "lamento no poder asistir", pantalla de éxito
  cálida, omisión del conteo cuando no asiste).

### 3. Revertir ocultamiento del intro — `index.html` + `js/main.js`

- Quitar `gone` del `<div id="intro">`.
- Restaurar el bloque de init que sólo corría con deep-link `?s=`, de modo que la
  pantalla del sobre vuelva a mostrarse y el tap "Abrir invitación" funcione.
  Los deep-links `?s=` siguen operando.

## Supuestos

- Los nombres en la pestaña `invitados` son **únicos** (se usan como clave de búsqueda).
- `cupos` es un entero = asientos totales incluyendo a la persona.

## Riesgos / mitigaciones

- **Fetch falla / sin red:** respaldo a input de texto libre (RSVP sigue funcionando).
- **Privacidad:** el dropdown expone todos los nombres invitados; aceptable para esta
  invitación (comportamiento típico).
- **Olvidar redeploy:** sin la nueva versión publicada, `action=invitados` no existe y
  el sitio cae al respaldo de texto libre — degradación elegante, no error.
