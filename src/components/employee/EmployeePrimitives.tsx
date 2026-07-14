import * as React from "react";
import { Link } from "react-router-dom";

/**
 * Employee Experience — shared UI primitives.
 * Consistent look-and-feel across HomeScreen, Library, Favorites,
 * Profile, Journey and content players. Palette follows the
 * existing "cream + orange + sage" identity used in HomeScreen.
 *
 * IMPORTANT: no business logic, no data fetching. Presentational only.
 */

const brand = "#F88A2B";
const ink900 = "#111111";
const ink500 = "#666666";
const ink400 = "#999999";
const cream = "#F7F4F2";

const serif = {
  fontFamily: "'Playfair Display', Georgia, serif",
  letterSpacing: "-0.015em",
} as const;

/* ============ Skeletons ============ */

export const EmployeeSkeleton: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`animate-pulse rounded-2xl bg-black/[0.05] ${className}`}
    aria-hidden="true"
  />
);

export const EmployeeCardSkeleton: React.FC = () => (
  <div
    className="rounded-[22px] p-4 bg-white/85"
    style={{ boxShadow: "0 6px 20px rgba(17,17,17,0.05)" }}
  >
    <EmployeeSkeleton className="h-11 w-11 rounded-full" />
    <EmployeeSkeleton className="h-3 w-24 mt-3" />
    <EmployeeSkeleton className="h-2 w-full mt-2" />
    <EmployeeSkeleton className="h-2 w-2/3 mt-1.5" />
  </div>
);

/* ============ Empty State ============ */

export interface EmployeeEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; to?: string; onClick?: () => void };
  variant?: "default" | "compact";
}

export const EmployeeEmptyState: React.FC<EmployeeEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  variant = "default",
}) => {
  const pad = variant === "compact" ? "p-5" : "p-8";
  return (
    <div
      className={`rounded-[22px] bg-white/85 backdrop-blur ${pad} text-center`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(17,17,17,0.04)" }}
      role="status"
    >
      {icon && (
        <div
          className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "#FFE9D4", color: brand }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <p
        className="text-[16px]"
        style={{ ...serif, color: ink900, fontWeight: 600 }}
      >
        {title}
      </p>
      {description && (
        <p className="mt-1 text-[12.5px]" style={{ color: ink500 }}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action.to ? (
            <Link
              to={action.to}
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-[13px] font-semibold text-white active:scale-[0.985] transition"
              style={{ background: brand }}
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-[13px] font-semibold text-white active:scale-[0.985] transition"
              style={{ background: brand }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ============ Section title ============ */

export const EmployeeSectionTitle: React.FC<{
  eyebrow?: string;
  title: string;
  action?: { label: string; to: string };
}> = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <div>
      {eyebrow && (
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ color: brand }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="text-[20px] leading-tight text-[#111]"
        style={{ ...serif, fontWeight: 600 }}
      >
        {title}
      </h2>
    </div>
    {action && (
      <Link
        to={action.to}
        className="text-[12px] font-semibold"
        style={{ color: brand }}
      >
        {action.label}
      </Link>
    )}
  </div>
);

/* ============ Progress Ring ============ */

export const EmployeeProgressRing: React.FC<{
  value: number;
  size?: number;
  label?: string;
}> = ({ value, size = 64, label }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#F1E4D4"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={brand}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[13px] font-bold"
          style={{ color: ink900, ...serif }}
        >
          {clamped}%
        </span>
        {label && (
          <span
            className="text-[8.5px] uppercase tracking-wider"
            style={{ color: ink400 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

/* ============ Mission of the day ============ */

export interface EmployeeMissionProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  to?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const EmployeeMissionCard: React.FC<EmployeeMissionProps> = ({
  title,
  description,
  ctaLabel = "Começar",
  to,
  onClick,
  icon,
}) => {
  const inner = (
    <div
      className="relative overflow-hidden rounded-[22px] p-4 active:scale-[0.99] transition"
      style={{
        background:
          "linear-gradient(135deg, #FFF1DD 0%, #FCE3C5 55%, #F4D0AA 100%)",
        boxShadow:
          "0 12px 30px -18px rgba(178,108,40,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/70 backdrop-blur shrink-0">
          {icon ?? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={brand}
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10.5px] uppercase tracking-[0.18em] font-semibold"
            style={{ color: "#9C5A1A" }}
          >
            Missão do dia
          </p>
          <p
            className="mt-1 text-[15px] leading-snug text-[#3D2A18]"
            style={{ ...serif, fontWeight: 500 }}
          >
            {title}
          </p>
          {description && (
            <p className="mt-1 text-[12px]" style={{ color: "#7A4316" }}>
              {description}
            </p>
          )}
          <span
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: brand }}
          >
            {ctaLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
  if (to) return <Link to={to} aria-label={title}>{inner}</Link>;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left" aria-label={title}>
      {inner}
    </button>
  );
};

/* ============ Recommendation card (with "why") ============ */

export interface EmployeeRecommendationProps {
  kind: "book" | "video" | "podcast" | "exercise" | "reflection";
  title: string;
  reason: string;
  to?: string;
  duration?: string;
}

const KIND_LABEL: Record<EmployeeRecommendationProps["kind"], string> = {
  book: "Livro",
  video: "Vídeo",
  podcast: "Podcast",
  exercise: "Exercício",
  reflection: "Reflexão",
};

export const EmployeeRecommendationCard: React.FC<EmployeeRecommendationProps> = ({
  kind,
  title,
  reason,
  to,
  duration,
}) => {
  const body = (
    <div
      className="rounded-[20px] p-4 bg-white/90 backdrop-blur active:scale-[0.985] transition"
      style={{ boxShadow: "0 6px 20px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(17,17,17,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-[0.16em] font-bold"
          style={{ color: brand }}
        >
          {KIND_LABEL[kind]}
        </span>
        {duration && (
          <span className="text-[10.5px]" style={{ color: ink400 }}>
            {duration}
          </span>
        )}
      </div>
      <p
        className="mt-1.5 text-[14.5px] leading-snug text-[#111]"
        style={{ ...serif, fontWeight: 600 }}
      >
        {title}
      </p>
      <p
        className="mt-2 text-[11.5px] leading-[16px]"
        style={{ color: ink500 }}
      >
        <span className="font-semibold" style={{ color: ink900 }}>
          Por que recomendamos:
        </span>{" "}
        {reason}
      </p>
    </div>
  );
  return to ? <Link to={to} aria-label={title}>{body}</Link> : body;
};

/* ============ Continue-where-left-off ============ */

export const EmployeeContinueCard: React.FC<{
  kind: string;
  title: string;
  subtitle?: string;
  progress?: number;
  to: string;
}> = ({ kind, title, subtitle, progress = 0, to }) => (
  <Link
    to={to}
    className="block rounded-[20px] p-3.5 bg-white/90 backdrop-blur active:scale-[0.985] transition"
    style={{ boxShadow: "0 6px 20px rgba(17,17,17,0.05), inset 0 0 0 1px rgba(17,17,17,0.04)" }}
    aria-label={`Continuar: ${title}`}
  >
    <p
      className="text-[10px] uppercase tracking-[0.16em] font-bold"
      style={{ color: brand }}
    >
      Continuar {kind}
    </p>
    <p
      className="mt-1 text-[13.5px] leading-tight text-[#111]"
      style={{ ...serif, fontWeight: 600 }}
    >
      {title}
    </p>
    {subtitle && (
      <p className="text-[11px] mt-0.5" style={{ color: ink500 }}>
        {subtitle}
      </p>
    )}
    <div className="mt-2 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, progress))}%`,
          background: `linear-gradient(90deg, ${brand} 0%, #FFB778 100%)`,
        }}
      />
    </div>
  </Link>
);

/* ============ Motivational micro-message ============ */

export const EmployeeMotivationLine: React.FC<{ message: string }> = ({
  message,
}) => (
  <p
    className="text-[12.5px] italic"
    style={{ color: ink500, ...serif }}
  >
    “{message}”
  </p>
);

/* ============ Journey Roadmap ============ */

export interface EmployeeJourneyStep {
  label: string;
  status: "done" | "current" | "todo";
}

export const EmployeeJourneyRoadmap: React.FC<{ steps: EmployeeJourneyStep[] }> = ({
  steps,
}) => (
  <ol className="relative flex flex-col gap-3 pl-6" aria-label="Sua jornada">
    <span
      className="absolute left-2 top-1 bottom-1 w-px"
      style={{ background: "#E9D6BD" }}
      aria-hidden="true"
    />
    {steps.map((s, i) => {
      const color =
        s.status === "done" ? "#7A9F6A" : s.status === "current" ? brand : ink400;
      const bg =
        s.status === "done" ? "#E3ECDD" : s.status === "current" ? "#FFE3CC" : cream;
      return (
        <li key={i} className="relative flex items-center gap-3">
          <span
            className="absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: bg, boxShadow: `inset 0 0 0 1.5px ${color}` }}
            aria-hidden="true"
          >
            {s.status === "done" ? (
              <svg width="8" height="8" viewBox="0 0 24 24" stroke={color} strokeWidth="3" fill="none">
                <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            )}
          </span>
          <p
            className="text-[13px]"
            style={{
              color: s.status === "todo" ? ink500 : ink900,
              fontWeight: s.status === "current" ? 700 : 500,
            }}
          >
            {s.label}
          </p>
        </li>
      );
    })}
  </ol>
);

/* ============ Level / XP pill ============ */

export const EmployeeXPPill: React.FC<{
  level: number;
  xp: number;
  nextXP: number;
}> = ({ level, xp, nextXP }) => {
  const pct = Math.min(100, Math.round((xp / Math.max(1, nextXP)) * 100));
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-3 h-8 bg-white/80 backdrop-blur"
      style={{ boxShadow: "inset 0 0 0 1px rgba(248,138,43,0.25)" }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: brand }}
      >
        Nv. {level}
      </span>
      <div className="w-16 h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${brand} 0%, #FFB778 100%)`,
          }}
        />
      </div>
      <span className="text-[10.5px]" style={{ color: ink500 }}>
        {xp}/{nextXP} XP
      </span>
    </div>
  );
};