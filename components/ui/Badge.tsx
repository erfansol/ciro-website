import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "live" | "soon" | "neutral" | "ar";

const tones: Record<Tone, string> = {
  live: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  soon: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  neutral: "bg-white/10 text-white/80 border-white/20",
  ar: "bg-brand-500/15 text-brand-400 border-brand-400/30",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider backdrop-blur",
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
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  );
}
