import Link from "next/link";
import Image from "next/image";
import { getSiteSettings } from "@/lib/siteSettings";
import { SocialLinks } from "@/components/SocialLinks";

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-surface-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 text-center text-sm text-foreground/60">
        {settings.logoUrl && (
          <Image
            src={settings.logoUrl}
            alt={settings.siteName}
            width={80}
            height={80}
            unoptimized
            className="h-16 w-16 shrink-0 object-contain"
          />
        )}

        <p className="max-w-md">{settings.footerText}</p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/" className="hover:text-brand">
            Início
          </Link>
          <Link href="/privacidade" className="hover:text-brand">
            Política de privacidade
          </Link>
          <Link href="/sobre" className="hover:text-brand">
            Sobre nós
          </Link>
        </nav>

        <SocialLinks
          variant="icons"
          instagramUrl={settings.instagramUrl}
          facebookUrl={settings.facebookUrl}
          threadsUrl={settings.threadsUrl}
          twitterUrl={settings.twitterUrl}
          pinterestUrl={settings.pinterestUrl}
          whatsappUrl={settings.whatsappUrl}
          telegramUrl={settings.telegramUrl}
        />

        <div className="w-full max-w-xs border-t border-surface-border" />

        <p className="text-foreground/40">
          © {year} {settings.siteName}
        </p>
      </div>
    </footer>
  );
}
