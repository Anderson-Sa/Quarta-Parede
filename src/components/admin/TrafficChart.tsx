/** Hand-rolled SVG bar chart for daily view totals — no charting library in
 * this project, and a few dozen bars don't warrant adding one. Pure/static,
 * so it renders fine as a server component. */
export function TrafficChart({ data }: { data: { date: Date; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 720;
  const height = 180;
  const gap = 2;
  const barWidth = data.length > 0 ? width / data.length - gap : 0;

  // Label every ~5th bar so the axis stays readable regardless of range size.
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height + 24}`}
        className="w-full min-w-[480px]"
        role="img"
        aria-label={`Visualizações diárias nos últimos ${data.length} dias`}
      >
        {data.map((d, i) => {
          const barHeight = (d.count / max) * height;
          const x = i * (barWidth + gap);
          const y = height - barHeight;
          const showLabel = i % labelEvery === 0 || i === data.length - 1;
          return (
            <g key={d.date.toISOString()}>
              <title>
                {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
                  d.date
                )}
                : {d.count.toLocaleString("pt-BR")} visualizações
              </title>
              <rect
                x={x}
                y={y}
                width={Math.max(1, barWidth)}
                height={Math.max(0, barHeight)}
                className="fill-brand/70"
                rx={1}
              />
              {showLabel && (
                <text
                  x={x + barWidth / 2}
                  y={height + 16}
                  textAnchor="middle"
                  className="fill-foreground/40 text-[9px]"
                >
                  {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
                    d.date
                  )}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
