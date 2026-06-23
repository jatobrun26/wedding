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
  ],

  // ---- Refactor "Sage Botanical" ----
  displayNames: "Jamil & Gaby",            // portada (resto del sitio: "Jamil & Gabriela")

  // Fotos de las secciones (reemplaza por las reales cuando las tengas)
  heroImage:    "assets/paint/villa.jpeg",  // villa pintada (acuarela hi-res) — fondo de portada
  messageImage: "assets/paint/couple.jpg",  // pareja en acuarela suave
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
};
