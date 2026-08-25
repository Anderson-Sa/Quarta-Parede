"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Folder,
  Tag,
  MessageSquare,
  Mail,
  Settings,
  Palette,
  Megaphone,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Início", icon: Home },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/categorias", label: "Categorias", icon: Folder },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/comentarios", label: "Comentários", icon: MessageSquare },
  { href: "/admin/assinantes", label: "Assinantes", icon: Mail },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/aparencia", label: "Aparência", icon: Palette },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

/** Top nav row with active-route highlighting and an optional pending-comments badge. */
export function AdminNav({ pendingComments = 0 }: { pendingComments?: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-6 py-2">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand/10 text-brand"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
            {item.href === "/admin/comentarios" && pendingComments > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">
                {pendingComments > 99 ? "99+" : pendingComments}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
