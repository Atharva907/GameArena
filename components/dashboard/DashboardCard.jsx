"use client";

const toneMap = {
  blue: {
    line: "bg-sky-500",
    icon: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
  },
  emerald: {
    line: "bg-emerald-500",
    icon: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
  },
  amber: {
    line: "bg-amber-500",
    icon: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
  },
  rose: {
    line: "bg-rose-500",
    icon: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
  },
  slate: {
    line: "bg-slate-500",
    icon: "bg-slate-500/10 text-slate-300 ring-slate-500/20",
  },
};

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const classes = toneMap[tone] || toneMap.blue;

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${classes.line}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">
            {value}
          </p>
          {description ? (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>

        {Icon ? (
          <div
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${classes.icon}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
