"use client";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 w-3/4 rounded bg-slate-800" />
      <div className="h-4 w-1/2 rounded bg-slate-800" />
    </div>
  );
}
