import Link from "next/link";
import {
  ArrowRight,
  FolderOpenDot,
  LayoutGrid,
  Package,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const adminSurfaceClass =
  "rounded-xl border border-border/70 bg-background/95 shadow-[0_10px_28px_-20px_rgba(15,23,42,0.55)]";

export const adminFieldClass =
  "h-9 rounded-lg border border-input bg-background px-3 text-[13px] leading-5 shadow-none outline-none transition focus-visible:ring-2 focus-visible:ring-rose-200 dark:focus-visible:ring-rose-900";

export const adminTextareaClass =
  "min-h-28 rounded-lg border border-input bg-background px-3 py-2.5 text-[13px] leading-5 shadow-none outline-none transition focus-visible:ring-2 focus-visible:ring-rose-200 dark:focus-visible:ring-rose-900";

export const adminSelectClass =
  "h-9 rounded-lg border border-input bg-background px-3 text-[13px] shadow-none focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900";

export const adminGhostButtonClass =
  "h-9 rounded-lg border-border/80 bg-background px-3 text-[13px] font-medium hover:bg-accent";

export const adminPrimaryButtonClass =
  "h-9 rounded-lg bg-rose-500 px-3.5 text-[13px] font-medium text-white hover:bg-rose-400 dark:bg-rose-400 dark:text-slate-950 dark:hover:bg-rose-300";

export const adminDangerButtonClass =
  "h-9 rounded-lg border-rose-200 bg-rose-50 px-3 text-[13px] font-medium text-rose-700 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60";

export const adminMobileCardClass =
  "rounded-xl border border-border/70 bg-muted/20 p-3.5";

export const adminTableWrapClass =
  "overflow-hidden rounded-xl border border-border/70 bg-background";

const statusToneMap = {
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  live: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  processing: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  shipped: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  upcoming: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300",
  featured: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-300",
  regular: "border-border bg-muted/60 text-muted-foreground",
  user: "border-border bg-muted/60 text-muted-foreground",
  admin: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  pending: "border-border bg-muted/60 text-muted-foreground",
};

const getMetricTone = (accent) => {
  const value = String(accent || "");

  if (value.includes("sky")) {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  }

  if (value.includes("amber")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  }

  if (value.includes("fuchsia")) {
    return "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300";
  }

  if (value.includes("emerald")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200";
};

export function AdminPage({ className, children }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-4 lg:space-y-5", className)}>
      {children}
    </div>
  );
}

export function AdminHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
  chips = [],
  className,
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 border-b border-border/70 pb-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        )}

        {chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {actions && <div className="flex flex-wrap gap-1.5">{actions}</div>}
    </section>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}) {
  return (
    <Card className={cn(adminSurfaceClass, className)}>
      {(title || description || action) && (
        <CardHeader className="gap-1.5 px-4 py-4 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              {title && <CardTitle className="text-base">{title}</CardTitle>}
              {description && (
                <CardDescription className="text-[13px] leading-5">
                  {description}
                </CardDescription>
              )}
            </div>
            {action}
          </div>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          "px-4 pb-4",
          title || description || action ? "pt-0" : "pt-4",
          contentClassName,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}

export function AdminMetric({
  label,
  value,
  detail,
  icon: Icon = LayoutGrid,
  accent = "",
}) {
  return (
    <Card className={adminSurfaceClass}>
      <CardContent className="flex items-start justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {detail && (
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{detail}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            getMetricTone(accent),
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
  icon: Icon = FolderOpenDot,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center",
        className,
      )}
    >
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <h3 className="mt-3 text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-5 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function AdminStatusBadge({ status, className, children }) {
  const tone =
    statusToneMap[String(status || "").toLowerCase()] ||
    "border-border bg-muted/60 text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        tone,
        className,
      )}
    >
      {children || status}
    </span>
  );
}

export function AdminCardAction({
  href,
  title,
  description,
  icon: Icon = Package,
  external = false,
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group rounded-xl border border-border/70 bg-background p-3.5 transition hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-muted/40 text-foreground">
          <Icon className="size-4" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{description}</p>
    </Link>
  );
}

export function AdminBackLink({ href, children = "Back" }) {
  return (
    <Button asChild variant="outline" className={adminGhostButtonClass}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}

export function AdminSecurityNote({ className }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3.5",
        className,
      )}
    >
      <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-foreground">
        <ShieldCheck className="size-4" />
      </div>
      <div>
        <p className="text-[13px] font-medium text-foreground">Standard admin palette</p>
        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
          Neutral surfaces, restrained accents, and consistent spacing keep the admin
          readable without pulling attention away from the work.
        </p>
      </div>
    </div>
  );
}
