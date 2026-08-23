import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import { NewsletterForm } from "@/components/NewsletterForm";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-surface-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>{settings.footerText}</p>
          <Link href="/privacidade" className="mt-2 inline-block text-foreground/40 hover:text-brand">
            Política de privacidade
          </Link>
        </div>
        <div>
          <p className="mb-2 font-medium text-foreground/80">Receba novidades por e-mail</p>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
