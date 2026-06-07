import { GraduationCap } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl";
  const ic = size === "lg" ? 48 : size === "sm" ? 22 : 32;
  return (
    <div className="flex items-center gap-3">
      <div className="grid place-items-center rounded-xl bg-primary/15 p-2 ring-1 ring-primary/30">
        <GraduationCap size={ic} className="text-primary-foreground" />
      </div>
      <span
        className={`${s} font-bold italic leading-none text-foreground`}
        style={{ fontFamily: "'Brush Script MT','Lucida Handwriting',cursive" }}
      >
        Agenda
        <br />
        Acadêmica
      </span>
    </div>
  );
}