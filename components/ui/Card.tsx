import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function Card({ className, glow, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-ink-900/8 dark:border-white/10 bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl transition-all duration-300",
        "hover:border-ink-900/15 dark:hover:border-white/20 hover:-translate-y-1",
        glow && "before:pointer-events-none before:absolute before:inset-0 before:bg-sunset before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-[0.06]",
        className,
      )}
      {...rest}
    />
  );
}
