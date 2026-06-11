import { Sparkles } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  const ic = size === "lg" ? 36 : size === "sm" ? 18 : 26;
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid place-items-center rounded-2xl p-2.5 shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Sparkles size={ic} className="text-primary-foreground" />
      </div>
      <span className={`${s} font-bold leading-none tracking-tight text-foreground`}>
        Mentora
      </span>
    </div>
  );
}