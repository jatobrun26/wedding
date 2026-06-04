/**
 * RSVP → Google Sheet  (Google Apps Script Web App)
 * --------------------------------------------------
 * Pasos (5 minutos, una sola vez):
 *
 * 1. Crea una hoja de cálculo nueva en https://sheets.google.com
 *    (será donde caen las confirmaciones).
 * 2. En esa hoja: menú  Extensiones → Apps Script.
 * 3. Borra el código de ejemplo y pega TODO este archivo.
 * 4. Clic en  Implementar (Deploy) → Nueva implementación → tipo "Aplicación web".
 *      - Ejecutar como:  Yo (tu cuenta)
 *      - Quién tiene acceso:  Cualquier usuario  (Anyone)
 *    Copia la URL que termina en /exec.
 * 5. Pega esa URL en  js/config.js  →  rsvpEndpoint: "https://.../exec"
 *
 * Listo: cada confirmación aparecerá como una fila nueva en la hoja "RSVP".
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RSVP') || ss.insertSheet('RSVP');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'Nombre', '¿Asiste?', 'Invitados', 'Mensaje']);
  }
  var p = (e && e.parameter) || {};
  sheet.appendRow([
    new Date(),
    p.nombre || '',
    p.asiste || '',
    p.invitados || '',
    p.mensaje || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput('RSVP endpoint OK');
}
