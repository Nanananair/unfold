import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "secondary", className = "", ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
  const styles = {
    primary: "bg-accent text-accent-ink hover:brightness-105",
    secondary: "bg-panel-2 text-ink border border-line hover:border-muted/60",
    ghost: "text-muted hover:text-ink",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...rest} />;
}

export function Card({
  children,
  selected = false,
  onClick,
  className = "",
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const border = selected ? "border-accent ring-1 ring-accent" : "border-line hover:border-muted/60";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`block w-full rounded-2xl border bg-panel p-4 text-left transition ${border} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-panel-2 px-2.5 py-1 text-xs text-muted">{children}</span>;
}
