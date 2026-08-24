import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, LogOut } from "lucide-react";
import { isAdminSessionValid } from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import { AdminNav } from "@/components/admin/AdminNav";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { logout } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdminSessionValid();
  if (!authenticated) redirect("/admin/login");

  const [pendingComments, settings] = await Promise.all([
    prisma.comment.count({ where: { approved: false } }),
    getSiteSettings(),
  ]);

  return (
    <div className="admin-shell min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-surface-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.siteName}
                width={40}
                height={40}
                unoptimized
                className="h-10 w-10 shrink-0 object-contain"
              />
            ) : (
              <span className="text-xl font-extrabold text-brand">{settings.siteName} Admin</span>
            )}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-foreground/60 hover:text-brand"
            >
              <ExternalLink className="h-4 w-4" />
              Ver blog
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 font-medium text-foreground/60 hover:text-brand"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-surface-border">
          <AdminNav pendingComments={pendingComments} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
