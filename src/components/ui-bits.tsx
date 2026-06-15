import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-4 ${className}`}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2>
      {action}
    </div>
  );
}

export function Field({
  label, value, onChange, type = "text", required, minLength, placeholder, rows,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  required?: boolean; minLength?: number; placeholder?: string; rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {rows ? (
        <textarea
          value={value} required={required} placeholder={placeholder} rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          type={type} value={value} required={required} minLength={minLength} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

export function SelectField({
  label, value, onChange, options, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select
        value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">Selecione…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function PrimaryButton({
  children, onClick, type = "button", loading, disabled, className = "",
}: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; loading?: boolean; disabled?: boolean; className?: string }) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled || loading}
      className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60 ${className}`}
      style={{ background: "var(--gradient-primary)" }}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({
  children, onClick, type = "button", className = "",
}: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string }) {
  return (
    <button
      type={type} onClick={onClick}
      className={`flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-secondary ${className}`}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 text-lg font-bold">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "warn" | "ok" | "danger" }) {
  const cls =
    tone === "warn" ? "bg-warning/20 text-warning"
    : tone === "ok" ? "bg-emerald-500/20 text-emerald-400"
    : tone === "danger" ? "bg-destructive/20 text-destructive"
    : "bg-secondary text-secondary-foreground";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}