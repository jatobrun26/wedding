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
var NOTIFY_EMAIL = "jamil.andres123@gmail.com";

// Pestaña donde se registran las confirmaciones (RSVP). Se crea sola si no existe.
var RSVP_SHEET = "RSVP";

// Pestaña con la lista de invitados (nombre + cupo máximo) que llena el dropdown del RSVP.
var INVITADOS_SHEET = "invitados";

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

  // Registra la respuesta en la pestaña "invitados" (Confirmado TRUE/FALSE, fecha y
  // n° de asistentes) y oculta el nombre de la lista del formulario.
  var attending = !/^\s*no/i.test(asiste); // "No podré asistir" → false; "Sí, asistiré" → true
  markInvitadoConfirmado_(nombre, attending, invitados);

  notify_("💌 Nueva confirmación — " + nombre,
    "Nombre: " + nombre + "\nAsistencia: " + asiste +
    "\nInvitados: " + invitados + (mensaje ? "\nMensaje: " + mensaje : ""));
  return { ok: true };
}

// Lee la pestaña "invitados" y devuelve [{ name, cupos }, …].
// Detecta columnas por encabezado: "nombre"/"invitad" → nombre, "cupo" → cupos.
// Respaldo si no hay encabezados reconocibles: A = nombre, B = cupos.
// Busca una pestaña por nombre sin distinguir mayúsculas ni espacios sobrantes.
function findSheetLoose_(ss, wanted) {
  var w = String(wanted).trim().toLowerCase();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().trim().toLowerCase() === w) return sheets[i];
  }
  return null;
}

// Índices de columna (1-based) en la pestaña invitados, detectados por encabezado
// (fila 1). "nombre"/"invitad" → nombre · "cupo" → cupos · "confirm" → confirmado ·
// "fecha"/"date" → fecha · "asisten" → asistentes (n° real que confirmó).
// Respaldo: A = nombre, B = cupos.
function invitadosCols_(sheet) {
  var lastCol = Math.max(1, sheet.getLastColumn());
  var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map(function (h) { return String(h).trim().toLowerCase(); });
  var cols = { name: -1, cupos: -1, confirmado: -1, fecha: -1, asistentes: -1 };
  for (var c = 0; c < header.length; c++) {
    if (cols.asistentes < 0 && header[c].indexOf("asisten") >= 0) cols.asistentes = c + 1;
    else if (cols.name < 0 && (header[c].indexOf("nombre") >= 0 || header[c].indexOf("invitad") >= 0)) cols.name = c + 1;
    if (cols.cupos < 0 && header[c].indexOf("cupo") >= 0) cols.cupos = c + 1;
    if (cols.confirmado < 0 && header[c].indexOf("confirm") >= 0) cols.confirmado = c + 1;
    if (cols.fecha < 0 && (header[c].indexOf("fecha") >= 0 || header[c].indexOf("date") >= 0)) cols.fecha = c + 1;
  }
  if (cols.name < 0) cols.name = 1;
  if (cols.cupos < 0) cols.cupos = 2;
  return cols;
}

// ¿La celda "Confirmado" está marcada como verdadera? (sólo TRUE/sí, no FALSE).
function isConfirmedCell_(v) {
  if (v === true) return true;
  var s = String(v).trim().toLowerCase();
  return s === "true" || s === "verdadero" || s === "sí" || s === "si" || s === "x" || s === "✓";
}

// ¿La fila ya respondió? (cualquier respuesta, Sí o No). Se usa para ocultarla
// de la lista. Marca: tiene fecha de confirmación, o Confirmado en TRUE.
function hasRespondedRow_(row, cols) {
  if (cols.fecha > 0 && String(row[cols.fecha - 1]).trim() !== "") return true;
  if (cols.confirmado > 0 && isConfirmedCell_(row[cols.confirmado - 1])) return true;
  return false;
}

// Crea las columnas "Confirmado" / "Fecha confirmación" / "Asistentes" si faltan.
function ensureInvitadosCols_(sheet, cols) {
  var last = sheet.getLastColumn();
  if (cols.confirmado < 0) { last++; sheet.getRange(1, last).setValue("Confirmado"); cols.confirmado = last; }
  if (cols.fecha < 0) { last++; sheet.getRange(1, last).setValue("Fecha confirmación"); cols.fecha = last; }
  if (cols.asistentes < 0) { last++; sheet.getRange(1, last).setValue("Asistentes"); cols.asistentes = last; }
  return cols;
}

// Registra la respuesta del invitado en la pestaña invitados:
//   Confirmado   = TRUE si asiste, FALSE si no podrá
//   Fecha        = fecha/hora de la respuesta (marca "ya respondió")
//   Asistentes   = n° de invitados que confirmó (0 si no asiste)
function markInvitadoConfirmado_(nombre, attending, invitadosCount) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = findSheetLoose_(ss, INVITADOS_SHEET);
  if (!sheet) return false;
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (e) { return false; }
  try {
    var cols = ensureInvitadosCols_(sheet, invitadosCols_(sheet));
    var data = sheet.getDataRange().getValues();
    var target = String(nombre).trim().toLowerCase();
    var n = parseInt(invitadosCount, 10);
    if (isNaN(n) || n < 0) n = 0;
    if (!attending) n = 0;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cols.name - 1]).trim().toLowerCase() === target) {
        sheet.getRange(i + 1, cols.confirmado).setValue(attending ? true : false);
        sheet.getRange(i + 1, cols.fecha).setValue(new Date());
        sheet.getRange(i + 1, cols.asistentes).setValue(n);
        SpreadsheetApp.flush();
        return true;
      }
    }
  } finally { lock.releaseLock(); }
  return false;
}

// Devuelve los invitados que AÚN no han confirmado (los confirmados se ocultan).
function listInvitados_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = findSheetLoose_(ss, INVITADOS_SHEET);
  if (!sheet) {
    var names = ss.getSheets().map(function (s) { return s.getName(); });
    return { ok: false, error: "No existe la pestaña '" + INVITADOS_SHEET +
      "'. Pestañas en este archivo: " + names.join(", ") };
  }

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return { ok: true, invitados: [] }; // sólo encabezado o vacío
  var cols = invitadosCols_(sheet);

  var invitados = [];
  for (var i = 1; i < values.length; i++) { // fila 1 = encabezado
    var name = String(values[i][cols.name - 1] || "").trim();
    if (!name) continue;
    if (hasRespondedRow_(values[i], cols)) continue; // ya respondió (Sí o No)
    var cupos = parseInt(values[i][cols.cupos - 1], 10);
    if (isNaN(cupos) || cupos < 1) cupos = 1;
    invitados.push({ name: name, cupos: cupos });
  }
  return { ok: true, invitados: invitados };
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
    if (p.action === "invitados") return output_(listInvitados_(), cb);
    return output_(listItems_(), cb); // 'list' por defecto
  } catch (err) {
    return output_({ ok: false, error: String(err) }, cb);
  }
}
