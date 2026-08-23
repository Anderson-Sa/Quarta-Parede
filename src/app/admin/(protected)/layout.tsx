import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminSessionValid } from "@/lib/adminSession";
import { logout } from "./actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAdminSessionValid();
  if (!authenticated) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="border-b border-neutral-300 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <Link href="/admin" className="text-xl font-extrabold text-brand">
            Quarta Parede Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="text-neutral-500 hover:text-brand">
              Ver blog
            </Link>
            <form action={logout}>
              <button type="submit" className="font-medium text-neutral-700 hover:text-brand">
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-neutral-100 px-6 py-2.5 text-sm font-medium text-neutral-700">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="shrink-0 hover:text-brand">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
