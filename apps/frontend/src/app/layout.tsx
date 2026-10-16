import type { Metadata } from "next";
import { headers } from "next/headers";
import { Roboto } from "next/font/google";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "ComeCore ERP",
    template: "%s · ComeCore",
  },
  description: "Plataforma administrativa para la operación integral de ISP.",
  icons: {
    icon: [{ url: "/brand/comecore-logo.jpeg", type: "image/jpeg" }],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="es" data-scroll-behavior="smooth" className={roboto.variable}>
      <body className={roboto.className}>
        <AppThemeProvider nonce={nonce}>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
