import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  color?: "violet" | "amber" | "rose" | "indigo";
  size?: number;
};

const colors: Record<NonNullable<Props["color"]>, string> = {
  violet: "rgba(139, 92, 246, 0.55)",
  amber: "rgba(245, 158, 11, 0.55)",
  rose: "rgba(244, 63, 94, 0.5)",
  indigo: "rgba(99, 102, 241, 0.5)",
};

export function GlowOrb({ className, color = "violet", size = 480 }: Props) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundImage: `radial-gradient(circle, ${colors[color]} 0%, rgba(0,0,0,0) 70%)`,
      }}
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl animate-drift",
        className,
      )}
    />
  );
}
