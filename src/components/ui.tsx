import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "secondary", className = "", ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";
  const styles = {
    primary:
      "bg-gradient-to-b from-[#ffc65e] to-[#f0a62b] text-accent-ink shadow-lg shadow-accent/20 hover:shadow-accent/35 hover:brightness-105",
    secondary: "bg-panel-2 text-ink border border-line hover:border-muted/60 hover:bg-panel-2/80",
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
  const border = selected
    ? "border-accent/80 bg-gradient-to-br from-accent/[0.09] to-panel shadow-[0_0_0_1px_var(--color-accent),0_12px_40px_-16px_var(--color-accent)]"
    : "border-line hover:border-muted/60 hover:bg-panel-2/60";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`block w-full rounded-2xl border bg-panel p-4 text-left transition-all duration-200 ${onClick ? "active:scale-[0.99]" : ""} ${border} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-panel-2 px-2.5 py-1 text-xs text-muted">{children}</span>;
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <rect width="512" height="512" rx="112" fill="#f5b03d" />
      <rect x="96" y="128" width="96" height="256" rx="16" fill="none" stroke="#1a1200" strokeWidth="24" />
      <rect x="232" y="128" width="184" height="256" rx="16" fill="none" stroke="#1a1200" strokeWidth="24" />
      <line x1="324" y1="150" x2="324" y2="362" stroke="#1a1200" strokeWidth="14" strokeDasharray="20 18" strokeLinecap="round" />
    </svg>
  );
}
