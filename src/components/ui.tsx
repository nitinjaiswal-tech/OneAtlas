"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowDownRight, ArrowUpRight, Bookmark, GitCompareArrows } from "lucide-react";
import type { Model } from "@/lib/types";

export function ProviderMark({ name, color, initials, size = "normal" }: { name: string; color: string; initials?: string; size?: "normal" | "large" }) {
  const letters = initials ?? name.slice(0, 1);
  return <span className={`provider-mark ${size === "large" ? "provider-mark-large" : ""}`} style={{ color, borderColor: `${color}40`, backgroundColor: `${color}12` }} aria-label={name}>{letters}</span>;
}

export function ModelCard({ model, compact = false }: { model: Model; compact?: boolean }) {
  const favorite = useListMembership("oneatlas:favorites", model.slug, "favorites-changed");
  const compared = useListMembership("oneatlas:compare", model.slug, "compare-changed");

  function toggleList(key: string, value: string, current: boolean) {
    const values = readSlugs(key);
    const next = current ? values.filter((slug) => slug !== value) : [...values, value].slice(-4);
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(key === "oneatlas:favorites" ? "favorites-changed" : "compare-changed"));
  }

  return (
    <article className={`model-card ${compact ? "model-card-compact" : ""}`}>
      <div className="model-card-head">
        <ProviderMark name={model.providerName} color={model.providerColor} />
        <div className="model-card-provider"><span>{model.providerName}</span><span className="model-category">{prettyCategory(model.category)}</span></div>
        <button className={`icon-button card-save ${favorite ? "is-saved" : ""}`} aria-label={favorite ? `Remove ${model.name} from favorites` : `Save ${model.name}`} title={favorite ? "Remove favorite" : "Save favorite"} onClick={() => toggleList("oneatlas:favorites", model.slug, favorite)}>
          <Bookmark size={16} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <Link href={`/models/${model.slug}`} className="model-card-title">{model.name}<span className="model-version">{model.version}</span></Link>
      <p className="model-card-description">{model.description}</p>
      <div className="model-tags">{model.capabilities.slice(0, compact ? 2 : 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="model-card-stats">
        <div><span>Input / 1M</span><strong>${model.inputPrice.toFixed(model.inputPrice < 1 ? 2 : 2)}</strong></div>
        <div><span>Output / 1M</span><strong>${model.outputPrice.toFixed(2)}</strong></div>
        <div><span>Context</span><strong>{formatContext(model.contextWindow)}</strong></div>
      </div>
      <div className="model-card-foot">
        <span className="popularity"><span className="popularity-dot" />{model.popularity} <span>popularity</span></span>
        <button className={`text-action ${compared ? "is-saved" : ""}`} onClick={() => toggleList("oneatlas:compare", model.slug, compared)}>
          <GitCompareArrows size={14} />{compared ? "Added" : "Compare"}
        </button>
      </div>
    </article>
  );
}

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, note, change, icon: Icon }: { label: string; value: string; note: string; change?: string; icon: React.ElementType }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div>
      <strong className="stat-value">{value}</strong>
      <div className="stat-note">{change && <span className="stat-change"><ArrowUpRight size={13} />{change}</span>}<span>{note}</span></div>
    </div>
  );
}

export function LoadingState({ label = "Loading catalog…" }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="spinner" />{label}</div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-state"><strong>Something went wrong</strong><p>{message}</p>{retry && <button className="button button-secondary" onClick={retry}>Try again</button>}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div className="empty-state-icon"><Bookmark size={19} /></div><strong>{title}</strong><p>{description}</p></div>;
}

export function formatContext(tokens: number) {
  return tokens >= 1_000_000 ? `${(tokens / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M` : `${Math.round(tokens / 1000)}K`;
}

export function prettyCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function readSlugs(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) && parsed.every((value) => typeof value === "string") ? parsed : [];
  } catch {
    return [];
  }
}

function useListMembership(key: string, slug: string, eventName: string) {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener(eventName, callback);
      return () => window.removeEventListener(eventName, callback);
    },
    () => readSlugs(key).includes(slug),
    () => false,
  );
}

export function Trend({ positive }: { positive: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return <Icon size={13} />;
}
