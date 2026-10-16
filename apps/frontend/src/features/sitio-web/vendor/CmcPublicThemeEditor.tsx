"use client";

import { useState } from "react";
import type { SiteResponse, SiteTheme } from "./shared/site";
import { themePresets, themeColorLabels } from "./shared/site-themes";
import { sanitizePublicTheme } from "./shared/public-theme.mjs";


type Props = { site: SiteResponse; mutateSite: (change: (draft: SiteResponse) => void) => void; canWrite: boolean; busy: boolean; onPublish: () => void; publicUrl: string; publishDisabled?: boolean };

/** Restore the original palette wheels and color circles inside the existing CMS. */
export function CmcPublicThemeEditor({ site, mutateSite, canWrite, busy, onPublish, publicUrl, publishDisabled }: Props) {
  const [error, setError] = useState("");
  const theme = site.settings.theme;
  const promotion = site.settings.seasonalPromotions[theme.id] || { eyebrow: "", title: "", message: "", date: "", image: "" };
  function choose(preset: SiteTheme) {
    setError("");
    mutateSite(draft => { draft.settings.theme = { id: preset.id, name: preset.name, colors: { ...preset.colors } }; });
  }
  function changeColor(key: keyof SiteTheme["colors"], value: string) {
    setError("");
    mutateSite(draft => { draft.settings.theme = { id: "personalizada", name: "Personalizada", colors: { ...draft.settings.theme.colors, [key]: value.toUpperCase() } }; });
  }
  function preview() {
    try {
      const safe = sanitizePublicTheme({ id: theme.id, name: theme.name, colors: theme.colors });
      const origin = new URL(publicUrl).origin;
      window.open(`${origin}/#cms-theme-preview=${encodeURIComponent(JSON.stringify(safe))}`, "_blank", "noopener,noreferrer");
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Revisa los colores antes de previsualizar."); }
  }
  function publish() {
    try { sanitizePublicTheme(theme); setError(""); onPublish(); }
    catch (err) { setError(err instanceof Error ? err.message : "Revisa los colores antes de publicar."); }
  }
  return <article className="cmc-panel cmc-editor cmc-appearance-editor cmc-public-theme-editor" style={{ order: -20 }} aria-label="Apariencia del sitio">
    <div className="cmc-panel-heading"><div><h3>Paletas de temporada</h3></div><span className="cmc-tag">{theme.name}</span></div>
    <p className="cmc-editor-help">Elige una temática o ajusta cada círculo de color. Publica los cambios para aplicarlos al sitio local.</p>
    <fieldset disabled={!canWrite || busy}>
      <legend className="cmc-visually-hidden">Seleccionar temática</legend>
      <div className="cmc-palette-grid">{themePresets.map(preset => <button key={preset.id} type="button" className={theme.id === preset.id ? "is-active" : ""} aria-pressed={theme.id === preset.id} onClick={() => choose(preset)}>
        <span className="cmc-palette-wheel" aria-hidden="true">{Object.values(preset.colors).slice(0,6).map((color,index) => <i key={index} style={{ backgroundColor: color }}/>)}</span>
        <span><b>{preset.name}</b><small>{preset.description}</small></span>
        <em>{theme.id === preset.id ? "Seleccionada" : "Aplicar"}</em>
      </button>)}</div>
      <div className="cmc-custom-colors">{Object.entries(themeColorLabels).map(([key,label]) => <label key={key}>
        <input type="color" aria-label={label} value={theme.colors[key as keyof SiteTheme["colors"]]} onChange={event => changeColor(key as keyof SiteTheme["colors"],event.target.value)}/>
        <span><b>{label}</b><small>{theme.colors[key as keyof SiteTheme["colors"]]}</small></span>
      </label>)}</div>
      {theme.id !== "cometalink" && theme.id !== "personalizada" && <div className="cmc-seasonal-copy"><div><h4>Contenido de {theme.name}</h4><p>La temática decora toda la página y sus planes. Puedes añadir un mensaje de temporada si lo necesitas.</p></div>
        <div className="cmc-fields cols-2">{(["eyebrow","date","title","image","message"] as const).map(key => <label className="cmc-field" key={key}><span>{{eyebrow:"Etiqueta de temporada",date:"Fecha o vigencia",title:"Título promocional",image:"Imagen opcional",message:"Mensaje"}[key]}</span>{key === "message" ? <textarea rows={3} value={promotion?.[key] || ""} onChange={event => mutateSite(draft => { draft.settings.seasonalPromotions[theme.id] = { ...promotion, [key]:event.target.value }; })}/> : <input value={promotion?.[key] || ""} onChange={event => mutateSite(draft => { draft.settings.seasonalPromotions[theme.id] = { ...promotion, [key]:event.target.value }; })}/>}</label>)}</div>
      </div>}
    </fieldset>
    {error && <div className="cmc-form-alert" role="alert">{error}</div>}
    <div className="cmc-public-theme-footer"><button type="button" className="cmc-secondary" disabled={busy} onClick={preview}>Previsualizar paleta</button>{canWrite && <button type="button" className="cmc-primary compact" disabled={busy || publishDisabled} onClick={publish}>{busy ? "Publicando…" : "Publicar en sitio local"}</button>}</div>
    <p className="cmc-editor-help">La vista previa aplica los colores sobre el contenido ya publicado. Para comprobar los textos del borrador, incluidos los de temporada, publica primero en la copia local.</p>
  </article>;
}
