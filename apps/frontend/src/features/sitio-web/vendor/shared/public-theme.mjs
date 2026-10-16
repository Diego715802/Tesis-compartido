import { defaultAppearance, resolveAppearance, sanitizeAppearance } from "./cmc-themes.mjs";

// Shared by the page, CMS and backend. Recovered IDs and AA-compliant legacy
// palettes remain available alongside the eight official seasonal options.
export const themePresets = [
  { id: "cometalink", name: "Tema Normal", description: "Identidad azul y cian original de CometaLink.", colors: { navy: "#061A31", navy2: "#092746", blue: "#0067A3", blue2: "#006FB1", cyan: "#00C4DF", cyan2: "#31DCF2", paper: "#F5F3EF", ice: "#EEF8FB" } },
  { id: "dia-de-muertos", name: "Día de Muertos", description: "Morado profundo, cempasúchil y tonos cálidos.", colors: { navy: "#27113D", navy2: "#3B2052", blue: "#A5410B", blue2: "#B14610", cyan: "#FFC15A", cyan2: "#FFE2A3", paper: "#FFF7EB", ice: "#F5EEF9" } },
  { id: "navidad", name: "Navidad", description: "Verde profundo, rojo y acentos dorados.", colors: { navy: "#073B2A", navy2: "#0B4F3C", blue: "#B21E35", blue2: "#D62839", cyan: "#F4C542", cyan2: "#FFE08A", paper: "#FAF6ED", ice: "#EDF7F1" } },
  { id: "reyes-magos", name: "Reyes Magos", description: "Azul de la noche de Reyes y acentos de oro.", colors: { navy: "#111D47", navy2: "#243B63", blue: "#765411", blue2: "#896412", cyan: "#F2CF73", cyan2: "#FFE6A3", paper: "#FBF7ED", ice: "#EFF3FB" } },
  { id: "san-valentin", name: "Día del Amor y la Amistad", description: "Vino elegante, frambuesa, rosa y crema.", colors: { navy: "#4A1025", navy2: "#651432", blue: "#A61E4D", blue2: "#B72559", cyan: "#FFB1C8", cyan2: "#FFD5E2", paper: "#FFF7F8", ice: "#FDECF1" } },
  { id: "dia-de-la-bandera", name: "Día de la Bandera", description: "Verde bandera, rojo profundo y marfil.", colors: { navy: "#005C3B", navy2: "#08704A", blue: "#A51D2D", blue2: "#B52234", cyan: "#FFE3A3", cyan2: "#FFF0C4", paper: "#FAF6ED", ice: "#F1F8F3" } },
  { id: "dia-de-la-madre", name: "Día de la Madre", description: "Rosas cálidos, flores y fondos de crema.", colors: { navy: "#401D2E", navy2: "#582E42", blue: "#9D365D", blue2: "#AE426B", cyan: "#FFBACD", cyan2: "#FFDAE4", paper: "#FFF8F5", ice: "#FAEFF1" } },
  { id: "dia-de-la-mujer", name: "Día de la Mujer", description: "Morados, lavanda y detalles de respeto e igualdad.", colors: { navy: "#2D1848", navy2: "#452963", blue: "#69418D", blue2: "#7A4A9D", cyan: "#DDBDF5", cyan2: "#EFDEFD", paper: "#FBF7FD", ice: "#F4EDF9" } },
  { id: "halloween", name: "Halloween", description: "Morado nocturno y naranja luminoso.", legacy: true, colors: { navy: "#1E102E", navy2: "#30164C", blue: "#A94400", blue2: "#C44F00", cyan: "#A65CFF", cyan2: "#C68CFF", paper: "#FAF5EE", ice: "#F3EAF9" } },
  { id: "buen-fin", name: "Buen Fin", description: "Negro, rojo promocional y amarillo.", legacy: true, colors: { navy: "#111111", navy2: "#272223", blue: "#C91422", blue2: "#D21A2B", cyan: "#FFCA0A", cyan2: "#FFE067", paper: "#F7F4EE", ice: "#FFF6D8" } },
  { id: "black-friday", name: "Black Friday", description: "Negro intenso, rojo y contraste promocional.", legacy: true, colors: { navy: "#090909", navy2: "#1A1A1A", blue: "#CC071E", blue2: "#D51D30", cyan: "#FFD028", cyan2: "#FFE57A", paper: "#F6F3EE", ice: "#FFF4CF" } },
  { id: "mes-patrio", name: "Mes Patrio México", description: "Verde bandera, rojo profundo, marfil y oro.", legacy: true, colors: { navy: "#005C3B", navy2: "#08704A", blue: "#A51D2D", blue2: "#B52234", cyan: "#FFE3A3", cyan2: "#FFF0C4", paper: "#FAF6ED", ice: "#F1F8F3" } },
];

export const defaultSiteTheme = { id: "cometalink", name: "CometaLink", colors: { ...themePresets[0].colors } };
export const themeColorLabels = {
  navy: "Fondo profundo", navy2: "Fondo secundario", blue: "Acción principal", blue2: "Acción secundaria",
  cyan: "Acento", cyan2: "Acento suave", paper: "Fondo cálido", ice: "Fondo claro",
};

const colorKeys = Object.keys(themeColorLabels);
const fail = message => { throw Object.assign(new Error(message), { status: 400 }); };
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const siteId = id => id === "normal" ? "cometalink" : id;

export function publicThemeById(id) {
  return themePresets.find(theme => theme.id === siteId(id)) || themePresets[0];
}

function luminance(hex) {
  const [red, green, blue] = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Validate public site configuration without carrying account metadata. */
export function sanitizePublicTheme(input, fallback = defaultSiteTheme) {
  if (input !== undefined && input !== null && !object(input)) fail("La temática de la página no es válida.");
  const source = input || fallback;
  const id = siteId(source.id === undefined ? fallback.id : source.id);
  if (typeof id !== "string" || (id !== "personalizada" && !themePresets.some(theme => theme.id === id))) {
    fail("La temática seleccionada no existe.");
  }
  if (source.colors !== undefined && !object(source.colors)) fail("La paleta de colores no es válida.");
  const preset = publicThemeById(id);
  const baseColors = id === siteId(fallback.id) ? fallback.colors : preset.colors;
  const colors = Object.fromEntries(colorKeys.map(key => {
    const value = source.colors?.[key] ?? baseColors?.[key] ?? defaultSiteTheme.colors[key];
    if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value)) fail(`Revisa el color de ${themeColorLabels[key].toLocaleLowerCase("es-MX")}.`);
    return [key, value.toUpperCase()];
  }));
  const pairs = [
    ...[colors.navy, colors.navy2, colors.blue, colors.blue2].map(background => ["#FFFFFF", background]),
    ...[colors.cyan, colors.cyan2].map(foreground => [foreground, colors.navy]),
    ...[colors.paper, colors.ice].map(background => ["#122A50", background]),
  ];
  if (pairs.some(([foreground, background]) => contrast(foreground, background) < 4.5)) {
    fail("La paleta no alcanza el contraste mínimo de lectura. Oscurece los fondos y acciones o aumenta el contraste de los acentos.");
  }
  const name = typeof source.name === "string" ? source.name.trim().slice(0, 60) : "";
  const result = { id, name: name || (id === "personalizada" ? "Personalizada" : id === "cometalink" ? defaultSiteTheme.name : preset.name), colors };
  if (source.appearance !== undefined) {
    if (!object(source.appearance)) fail("La programación de la temática no es válida.");
    // The site uses cometalink; the existing shared scheduler uses normal.
    result.appearance = sanitizeAppearance({ ...source.appearance, manualTheme: source.appearance.manualTheme === "cometalink" ? "normal" : source.appearance.manualTheme });
  }
  return result;
}

export const validatePublicTheme = sanitizePublicTheme;

/** Resolve a public view; never persist this over the saved schedule. */
export function resolvePublicTheme(input, now = Date.now()) {
  const theme = sanitizePublicTheme(input);
  const appearance = theme.appearance || sanitizeAppearance(defaultAppearance(theme.id));
  const active = resolveAppearance(appearance, now);
  const selected = appearance.mode === "automatic" ? publicThemeById(active.activeTheme) : theme;
  return { id: selected.id, name: selected.id === "cometalink" && appearance.mode === "automatic" ? defaultSiteTheme.name : selected.name, colors: { ...selected.colors }, appearance, ...active };
}
