import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteSettings } from "@/lib/siteSettings";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
