/**
 * Lista de regalos con reservas  →  Google Sheet  (Google Apps Script Web App)
 * ----------------------------------------------------------------------------
 * Pasos (una sola vez, ~5 minutos):
 *
 * 1. Abre TU hoja de regalos en https://sheets.google.com
 *    (la que tiene las columnas:  Reservado | Regalo | Reservador por Nombre/familia).
 * 2. Menú  Extensiones → Apps Script.
 * 3. Borra el código de ejemplo y pega TODO este archivo.
 * 4. Clic en  Implementar (Deploy) → Nueva implementación → tipo "Aplicación web".
 *      - Ejecutar como:        Yo (tu cuenta)
 *      - Quién tiene acceso:   Cualquier usuario  (Anyone)
 *    Copia la URL que termina en  /exec.
 * 5. Pega esa URL en  js/config.js  →  giftEndpoint: "https://.../exec"
 *
 * Si más adelante editas este código, debes  Implementar → Administrar implementaciones
 * → editar (lápiz) → "Nueva versión" para que los cambios surtan efecto.
 *
 * El sitio se comunica por JSONP (parámetro ?callback=) para evitar problemas de CORS.
 * Acciones:
 *   ?action=list                          → devuelve los regalos disponibles (no reservados)
 *   ?action=reserve&familia=..&rows=12,15 → reserva esos regalos para esa familia
 */

// Nombre de la pestaña con la lista. Déjalo en "" para usar la primera hoja.
var SHEET_NAME = "";

// Correo donde recibir avisos de reservas y confirmaciones (RSVP). Déjalo en "" para no enviar.
var NOTIFY_EMAIL = "jbrunes@udtonline.com";

// Pestaña donde se registran las confirmaciones (RSVP). Se crea sola si no existe.
var RSVP_SHEET = "RSVP";

// Índices de columna (1 = A). Ajusta solo si cambias el orden de columnas.
var COL_RESERVADO = 1; // A
var COL_REGALO    = 2; // B
var COL_FAMILIA   = 3; // C

function notify_(subject, body) {
  if (!NOTIFY_EMAIL) return;
  try { MailApp.sendEmail(NOTIFY_EMAIL, subject, body); } catch (e) {}
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (SHEET_NAME) return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  return ss.getSheets()[0];
}

function isReserved_(value) {
  return String(value).trim().toUpperCase() === "TRUE";
}

// ¿Es una fila de regalo de verdad? (tiene nombre y no es el encabezado)
function isItemRow_(rowValues) {
  var regalo = String(rowValues[COL_REGALO - 1] || "").trim();
  var reservadoCell = String(rowValues[COL_RESERVADO - 1] || "").trim();
  if (!regalo) return false;                 // fila vacía
  if (regalo.toLowerCase() === "regalo") return false;        // encabezado
  if (reservadoCell.toLowerCase() === "reservado") return false; // encabezado
  return true;
}

function listItems_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var items = [];
  for (var i = 0; i < values.length; i++) {
    if (!isItemRow_(values[i])) continue;
    if (isReserved_(values[i][COL_RESERVADO - 1])) continue; // ocultar reservados
    items.push({
      row: i + 1, // número de fila real en la hoja (1-based)
      name: String(values[i][COL_REGALO - 1]).trim()
    });
  }
  return { ok: true, items: items };
}

function reserve_(params) {
  var familia = String(params.familia || "").trim();
  var rowsRaw = String(params.rows || "").trim();
  if (!familia) return { ok: false, error: "Falta el nombre de la familia." };
  if (!rowsRaw) return { ok: false, error: "No se seleccionó ningún regalo." };

  var rows = rowsRaw.split(",").map(function (r) { return parseInt(r, 10); })
                    .filter(function (r) { return !isNaN(r); });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // espera hasta 15s por si otra familia reserva al mismo tiempo
  } catch (e) {
    return { ok: false, error: "El sistema está ocupado, intenta de nuevo." };
  }

  var reserved = [];
  var taken = [];
  try {
    var sheet = getSheet_();
    for (var k = 0; k < rows.length; k++) {
      var r = rows[k];
      var regalo = String(sheet.getRange(r, COL_REGALO).getValue()).trim();
      if (!regalo) continue; // fila inválida
      var current = sheet.getRange(r, COL_RESERVADO).getValue();
      if (isReserved_(current)) {
        taken.push(regalo); // alguien la tomó primero
      } else {
        sheet.getRange(r, COL_RESERVADO).setValue(true);
        sheet.getRange(r, COL_FAMILIA).setValue(familia);
        reserved.push(regalo);
      }
    }
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  if (reserved.length) {
    notify_("🎁 Nueva reserva de regalo — " + familia,
      familia + " reservó:\n• " + reserved.join("\n• ") +
      (taken.length ? "\n\nYa estaban tomados:\n• " + taken.join("\n• ") : ""));
  }
  return { ok: true, reserved: reserved, taken: taken };
}

function rsvp_(params) {
  var nombre    = String(params.nombre || "").trim();
  var asiste    = String(params.asiste || "").trim();
  var invitados = String(params.invitados || "").trim();
  var mensaje   = String(params.mensaje || "").trim();
  if (!nombre) return { ok: false, error: "Falta el nombre." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RSVP_SHEET) || ss.insertSheet(RSVP_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Fecha", "Nombre", "¿Asiste?", "Invitados", "Mensaje"]);
  }
  sheet.appendRow([new Date(), nombre, asiste, invitados, mensaje]);

  notify_("💌 Nueva confirmación — " + nombre,
    "Nombre: " + nombre + "\nAsistencia: " + asiste +
    "\nInvitados: " + invitados + (mensaje ? "\nMensaje: " + mensaje : ""));
  return { ok: true };
}

function output_(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = p.callback || "";
  try {
    if (p.action === "reserve") return output_(reserve_(p), cb);
    if (p.action === "rsvp") return output_(rsvp_(p), cb);
    return output_(listItems_(), cb); // 'list' por defecto
  } catch (err) {
    return output_({ ok: false, error: String(err) }, cb);
  }
}
