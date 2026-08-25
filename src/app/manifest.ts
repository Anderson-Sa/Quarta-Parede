import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/siteSettings";

// Lets mobile browsers offer "Add to Home Screen" with the site's own name,
// brand color, and icon instead of a generic browser shortcut. Same timed
// revalidation as sitemap.ts, since siteName/brandColor are admin-editable.
export const revalidate = 300;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();

  return {
    name: settings.siteName,
    short_name: settings.siteName,
    description: settings.slogan,
    start_url: "/",
    display: "standalone",
    background_color: "#101012",
    theme_color: settings.brandColor,
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
