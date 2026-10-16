import type { Appearance } from "./cmc-themes.mjs";

export type Plan = {
  id: string;
  name: string;
  speed: number;
  price: number;
  tagline: string;
  popular?: boolean;
  features: string[];
  streaming: string;
  gaming: string;
};

export type Tower = {
  id: string;
  name: string;
  municipality: string;
  postalCode: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

export type Faq = {
  question: string;
  answer: string;
};

export type SiteResponse = {
  settings: SiteSettings;
  plans: Plan[];
  towers: Tower[];
  faqs: Faq[];
  source: "cometalink-web";
};

export type SiteTheme = { id: string; name: string; colors: { navy: string; navy2: string; blue: string; blue2: string; cyan: string; cyan2: string; paper: string; ice: string }; appearance?: Appearance };
export type SiteSettings = {
  company: { brand: string; legalName: string; rfc: string; address: string; hours: { weekdays: string; saturday: string }; whatsapp: string; email: string; supportEmail: string; general: { support: string[]; payments: string[]; sales: string[] } };
  heroSlides: { eyebrow: string; title: string; emphasis: string; copy: string; image: string; imageAlt: string; badge: string }[];
  corporateIdentity: { mission: string; vision: string; values: { title: string; description: string; icon?: string }[] };
  pageCopy: Record<string, string>;
  theme: SiteTheme;
  maintenance: { enabled: boolean; eyebrow?: string; title: string; message: string; image: string; buttonLabel?: string };
  seasonalPromotions: Record<string, { eyebrow: string; title: string; message: string; date: string; image: string }>;
  coverageKicker: string; coverageTitle: string; coverageLead: string; servicesLead: string; plansLead: string;
};

export type QuoteRequestInput = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address?: string;
  message?: string;
  planId?: string;
  privacyAccepted: boolean;
  marketingConsent?: boolean;
};

export type QuoteRequestResponse = {
  id: string;
  persisted: boolean;
  whatsappUrl: string;
};
