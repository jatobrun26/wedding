/* =========================================================================
   CONFIGURACIÓN — edita SOLO este archivo para cambiar los datos de la boda.
   ========================================================================= */
window.WEDDING_CONFIG = {
  // Nombres de la pareja
  names: "Jamil & Gabriela",
  initials: { left: "J", right: "G" },

  // Fecha y hora de la ceremonia (zona horaria de Ecuador, UTC-5)
  dateISO: "2026-08-01T16:30:00-05:00",   // se usa para la cuenta regresiva
  ceremonyTitle: "Boda Civil · Jamil & Gabriela",
  ceremonyDetails: "¡Nos encantaría que formes parte de este momento tan especial!",

  // Horario para "Agendar" (.ics): de 16:00 a 00:00 (medianoche)
  calStartISO: "2026-08-01T16:00:00-05:00",
  calEndISO:   "2026-08-02T00:00:00-05:00",

  // Lugar
  venueName: "Samborondón",
  venueCity: "Samborondón, Ecuador",
  mapQuery: "Samborondón, Ecuador",   // texto de respaldo si no hay coordenadas
  // Coordenadas exactas del lugar (pin en Google Maps). Si están vacías se usa mapQuery.
  mapLat: "-2.157539",
  mapLng: "-79.865478",

  // RSVP por WhatsApp (el formulario abre WhatsApp con el mensaje ya escrito)
  rsvpDeadlineText: "15 de julio del 2026",
  whatsappNumber: "593939498845",   // número internacional sin "+" ni espacios

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
