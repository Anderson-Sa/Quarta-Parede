import { getSiteSettings } from "@/lib/siteSettings";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-surface-border">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-foreground/60">
        <p>{settings.footerText}</p>
      </div>
    </footer>
  );
}
