/* =========================================================================
   CONFIGURACIÓN — edita SOLO este archivo para cambiar los datos de la boda.
   ========================================================================= */
window.WEDDING_CONFIG = {
  // Nombres de la pareja
  names: "Jamil & Gabriela",
  initials: { left: "J", right: "G" },

  // Fecha y hora de la ceremonia (zona horaria de Ecuador, UTC-5)
  dateISO: "2026-08-01T16:30:00-05:00",
  ceremonyTitle: "Boda Civil · Jamil & Gabriela",
  ceremonyDetails: "¡Nos encantaría que formes parte de este momento tan especial!",

  // Lugar
  venueName: "Samborondón",
  venueCity: "Samborondón, Ecuador",
  mapQuery: "Samborondón, Ecuador",   // se usa para abrir Google Maps

  // RSVP
  rsvpDeadlineText: "15 de julio del 2026",
  // URL del Web App de Google Apps Script (ver README_DEPLOY.md → sección RSVP).
  // Déjalo en "" mientras no lo tengas: el formulario lo recordará y avisará.
  rsvpEndpoint: "",

  // Video (sube tu reel a YouTube/Vimeo como "no listado" y pega el enlace aquí).
  // Acepta enlaces normales de YouTube/Vimeo. Déjalo en "" para ocultar el video.
  videoUrl: "",

  // Música de fondo (coloca un .mp3 en assets/music/ y pon el nombre aquí).
  // Déjalo en "" para ocultar el botón de música.
  musicSrc: "",

  // Galería (generada automáticamente desde tus fotos).
  gallery: [
    "g01", "g02", "g03", "g04", "g05", "g06", "g07",
    "g08", "g09", "g10", "g11", "g12", "g13", "g14"
  ]
};
