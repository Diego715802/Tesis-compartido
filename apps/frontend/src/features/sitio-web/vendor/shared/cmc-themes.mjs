// One catalog and clock policy for the API, scheduler, and CMS preview.
export const CMC_TIME_ZONE = "America/Mexico_City";
export const cmcThemes = [
  { id: "normal", name: "Tema Normal", description: "Diseño corporativo, sin decoraciones.", accent: "#087EBD", motif: "none" },
  { id: "dia-de-muertos", name: "Día de Muertos", description: "Papel picado, cempasúchil, calaveritas y veladoras.", accent: "#9E4B11", motif: "muertos" },
  { id: "navidad", name: "Navidad", description: "Ramas, esferas, regalos y nieve suave.", accent: "#227052", motif: "christmas" },
  { id: "reyes-magos", name: "Reyes Magos", description: "Coronas, regalos y estrellas de la noche de Reyes.", accent: "#87651D", motif: "kings" },
  { id: "san-valentin", name: "Día del Amor y la Amistad", description: "Corazones, cartas y detalles de rosa.", accent: "#A53B65", motif: "love" },
  { id: "dia-de-la-bandera", name: "Día de la Bandera", description: "Cintas tricolor y decoración institucional respetuosa.", accent: "#246D52", motif: "flag" },
  { id: "dia-de-la-madre", name: "Día de la Madre", description: "Flores, pétalos y detalles cálidos.", accent: "#A24F61", motif: "mother" },
  { id: "dia-de-la-mujer", name: "Día de la Mujer", description: "Flores moradas y detalles de respeto e igualdad.", accent: "#73519D", motif: "women" },
  { id: "halloween", name: "Halloween", description: "Temática anterior: telarañas y murciélagos.", accent: "#875325", motif: "halloween", legacy: true },
  { id: "buen-fin", name: "Buen Fin", description: "Temática anterior: cintas y regalos.", accent: "#AB3045", motif: "sale", legacy: true },
  { id: "black-friday", name: "Black Friday", description: "Temática anterior: regalos y estrellas.", accent: "#465063", motif: "sale", legacy: true },
  { id: "mes-patrio", name: "Mes Patrio", description: "Temática anterior: cintas tricolor.", accent: "#246D52", motif: "flag", legacy: true },
];
export const themeById = (id) => cmcThemes.find(theme => theme.id === id) || cmcThemes[0];
export function defaultAppearance(legacyId = "normal") {
  return { mode: "manual", manualTheme: legacyId === "cometalink" ? "normal" : themeById(legacyId).id, animations: true, schedules: [], timeZone: CMC_TIME_ZONE, updatedAt: null, updatedBy: null };
}
// Ciudad de México is UTC-06 year-round. All configured dates are wall-clock
// dates in this one supported zone, independent of server/browser timezone.
export function mexicoTimestamp(value) {
  if (typeof value !== "string" || !/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const [year, month, day, hour, minute] = value.match(/\d+/g).map(Number);
  const utc = Date.UTC(year, month - 1, day, hour, minute);
  if (new Date(utc).toISOString().slice(0, 16) !== value) return NaN;
  return utc + 6 * 3600_000;
}
export function sanitizeAppearance(input) {
  const fail = message => { throw Object.assign(new Error(message), { status: 400 }); };
  if (!input || !["manual", "automatic"].includes(input.mode)) fail("Selecciona el modo Manual o Automático.");
  if (!cmcThemes.some(theme => theme.id === input.manualTheme)) fail("La temática seleccionada no existe.");
  if (typeof input.animations !== "boolean") fail("Indica si las animaciones están activadas.");
  if (!Array.isArray(input.schedules) || input.schedules.length > cmcThemes.length - 1) fail("La programación de temáticas no es válida.");
  const seen = new Set();
  const schedules = input.schedules.map(item => {
    if (!item || !cmcThemes.some(theme => theme.id === item.theme && theme.id !== "normal") || seen.has(item.theme)) fail("Cada temática debe tener una sola programación.");
    seen.add(item.theme);
    if (typeof item.enabled !== "boolean") fail("La activación automática no es válida.");
    const start = mexicoTimestamp(item.start), end = mexicoTimestamp(item.end);
    if ((item.enabled || item.start || item.end) && (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)) fail(`Revisa el inicio y finalización de ${themeById(item.theme).name}.`);
    return { theme: item.theme, enabled: item.enabled, start: item.start || "", end: item.end || "" };
  });
  const enabled = schedules.filter(item => item.enabled).sort((a, b) => mexicoTimestamp(a.start) - mexicoTimestamp(b.start));
  for (let i = 1; i < enabled.length; i++) {
    if (mexicoTimestamp(enabled[i].start) < mexicoTimestamp(enabled[i - 1].end)) fail("Las fechas activadas se superponen. Ajusta la programación para mantener una sola temática activa.");
  }
  return { mode: input.mode, manualTheme: input.manualTheme, animations: input.animations, schedules, timeZone: CMC_TIME_ZONE };
}
export function resolveAppearance(config, now = Date.now()) {
  let activeTheme = themeById(config.manualTheme).id;
  if (config.mode === "automatic") {
    activeTheme = config.schedules.find(item => item.enabled && now >= mexicoTimestamp(item.start) && now < mexicoTimestamp(item.end))?.theme || "normal";
  }
  const boundaries = config.mode === "automatic" ? config.schedules.filter(item => item.enabled).flatMap(item => [mexicoTimestamp(item.start), mexicoTimestamp(item.end)]).filter(at => at > now) : [];
  return { activeTheme, animations: config.animations, mode: config.mode, timeZone: CMC_TIME_ZONE, nextChangeAt: boundaries.length ? Math.min(...boundaries) : null, serverTime: now };
}
