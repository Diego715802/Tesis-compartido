import type { SiteTheme } from "./site";
import type { ActiveAppearance } from "./cmc-themes.mjs";

export type PublicThemePreset = SiteTheme & { description: string; legacy?: boolean };
export type ResolvedPublicTheme = SiteTheme & ActiveAppearance;
export const themePresets: PublicThemePreset[];
export const defaultSiteTheme: SiteTheme;
export const themeColorLabels: Record<keyof SiteTheme["colors"], string>;
export function publicThemeById(id?: string): PublicThemePreset;
export function sanitizePublicTheme(input: unknown, fallback?: SiteTheme): SiteTheme;
export const validatePublicTheme: typeof sanitizePublicTheme;
export function resolvePublicTheme(input: unknown, now?: number): ResolvedPublicTheme;
