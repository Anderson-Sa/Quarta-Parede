import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter, Poppins, Roboto } from "next/font/google";
import { getSiteSettings } from "@/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import { darkenHex } from "@/lib/color";
import type { FontFamilyValue } from "@/lib/siteSettings";
import "./globals.css";

// Anti-flash: applies the admin panel's saved light/dark preference (see
// src/components/admin/ThemeToggle.tsx) to <html> before hydration, so
// admin pages don't flash dark-then-light on load. Harmless on public blog
// pages — the attribute only has a visual effect where the `.admin-shell`
// class is present (see globals.css), and `beforeInteractive` scripts must
// live in the root layout, not a nested one, to actually run ahead of
// hydration instead of racing it.
const NO_FLASH_SCRIPT = `(function(){try{if(localStorage.getItem("admin-theme")==="light"){document.documentElement.setAttribute("data-admin-theme","light");}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Maps the admin-picked font family to the CSS variable produced by its
// next/font/google loader above, so it can be assigned to --font-sans.
const FONT_SANS_VAR: Record<FontFamilyValue, string> = {
  geist: "var(--font-geist-sans)",
  inter: "var(--font-inter)",
  poppins: "var(--font-poppins)",
  roboto: "var(--font-roboto)",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.siteName,
      template: `%s · ${settings.siteName}`,
    },
    description: settings.footerText,
    alternates: {
      types: {
        "application/rss+xml": `${siteUrl}/feed.xml`,
      },
    },
    openGraph: {
      siteName: settings.siteName,
      title: settings.siteName,
      description: settings.footerText,
      locale: "pt_BR",
      type: "website",
      url: siteUrl,
    },
    twitter: {
      card: "summary",
      title: settings.siteName,
      description: settings.footerText,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const themeStyle: CSSProperties & Record<string, string> = {
    "--brand": settings.brandColor,
    "--brand-dark": darkenHex(settings.brandColor),
    "--accent": settings.accentColor,
    "--font-sans": FONT_SANS_VAR[settings.fontFamily],
  };

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} ${roboto.variable} h-full antialiased`}
      style={themeStyle}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script id="admin-theme-no-flash" strategy="beforeInteractive">
          {NO_FLASH_SCRIPT}
        </Script>
      </body>
    </html>
  );
}
