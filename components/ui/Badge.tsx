import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "live" | "soon" | "neutral" | "ar";

// Flat chips. These mostly sit on dark imagery or dark story pages, so
// each tone is a solid tint with a plain border — no blur, no glow.
const tones: Record<Tone, string> = {
  live: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  soon: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  neutral: "bg-white/10 text-white/85 border-white/25",
  ar: "bg-brand-500/20 text-brand-300 border-brand-400/40",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}

export function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}
