import Link from "next/link";
import { BarChart3, Eye, TrendingUp, MessageSquare, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { EmptyState } from "@/components/admin/EmptyState";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { getDailyViewTotals } from "@/lib/postViews";

const TRAFFIC_WINDOW_OPTIONS = [7, 30, 90] as const;
const DEFAULT_TRAFFIC_WINDOW_DAYS = 30;

function parseWindowDays(rangeParam: string | string[] | undefined): number {
  const raw = Array.isArray(rangeParam) ? rangeParam[0] : rangeParam;
  const parsed = Number(raw);
  return (TRAFFIC_WINDOW_OPTIONS as readonly number[]).includes(parsed)
    ? parsed
    : DEFAULT_TRAFFIC_WINDOW_DAYS;
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const { range: rangeParam } = await searchParams;
  const TRAFFIC_WINDOW_DAYS = parseWindowDays(rangeParam);

  const windowStart = new Date();
  windowStart.setUTCDate(windowStart.getUTCDate() - (TRAFFIC_WINDOW_DAYS - 1));
  windowStart.setUTCHours(0, 0, 0, 0);

  const [daily, topPosts, viewsAgg, newSubscribers, newComments] = await Promise.all([
    getDailyViewTotals(TRAFFIC_WINDOW_DAYS),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { views: "desc" },
      take: 10,
      include: { category: true },
    }),
    prisma.post.aggregate({ _sum: { views: true } }),
    prisma.subscriber.count({ where: { createdAt: { gte: windowStart } } }),
    prisma.comment.count({ where: { createdAt: { gte: windowStart } } }),
  ]);

  const totalViews = viewsAgg._sum.views ?? 0;
  const windowViews = daily.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = Math.round(windowViews / TRAFFIC_WINDOW_DAYS);

  const cards = [
    {
      title: "Visualizações (total)",
      icon: Eye,
      stat: totalViews.toLocaleString("pt-BR"),
      statLabel: "desde sempre",
      tone: "text-brand bg-brand/10",
    },
    {
      title: `Visualizações (${TRAFFIC_WINDOW_DAYS}d)`,
      icon: TrendingUp,
      stat: windowViews.toLocaleString("pt-BR"),
      statLabel: `~${avgPerDay.toLocaleString("pt-BR")}/dia`,
      tone: "text-sky-400 bg-sky-400/10",
    },
    {
      title: `Novos assinantes (${TRAFFIC_WINDOW_DAYS}d)`,
      icon: Mail,
      stat: String(newSubscribers),
      statLabel: "na newsletter",
      tone: "text-emerald-400 bg-emerald-400/10",
    },
    {
      title: `Comentários (${TRAFFIC_WINDOW_DAYS}d)`,
      icon: MessageSquare,
      stat: String(newComments),
      statLabel: "recebidos",
      tone: "text-amber-400 bg-amber-400/10",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Tráfego e posts mais lidos do blog."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-surface-border p-1 text-sm">
            {TRAFFIC_WINDOW_OPTIONS.map((days) => (
              <Link
                key={days}
                href={days === DEFAULT_TRAFFIC_WINDOW_DAYS ? "/admin/analytics" : `/admin/analytics?range=${days}`}
                className={`rounded-md px-3 py-1 font-medium ${
                  days === TRAFFIC_WINDOW_DAYS
                    ? "bg-brand text-white"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {days}d
              </Link>
            ))}
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-surface-border bg-surface-muted p-4">
            <div className={`inline-flex rounded-lg p-2 ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-foreground">{card.stat}</p>
            <p className="text-xs font-medium text-foreground/50">{card.title}</p>
            <p className="text-xs text-foreground/30">{card.statLabel}</p>
          </div>
        ))}
      </div>

      <AdminCard className="mt-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
          <BarChart3 className="h-4 w-4" />
          Visualizações por dia (últimos {TRAFFIC_WINDOW_DAYS} dias)
        </h2>
        {windowViews === 0 ? (
          <EmptyState icon={BarChart3} message="Sem dados de tráfego neste período ainda." />
        ) : (
          <div className="mt-4">
            <TrafficChart data={daily} />
          </div>
        )}
      </AdminCard>

      <AdminCard className="mt-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/50">
          <TrendingUp className="h-4 w-4" />
          Posts mais vistos
        </h2>
        {topPosts.length === 0 ? (
          <EmptyState icon={TrendingUp} message="Sem dados de visualização ainda." />
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-surface-border">
            {topPosts.map((post, i) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
              >
                <span className="w-5 shrink-0 text-xs font-bold text-foreground/30">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                  <p className="text-xs text-foreground/40">{post.category.name}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-foreground/40">
                  <Eye className="h-3 w-3" />
                  {post.views.toLocaleString("pt-BR")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
