"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Plus, Scale } from "lucide-react";
import { ErrorState, LoadingState, PageHeading, ProviderMark, formatContext, readSlugs } from "@/components/ui";
import type { Model } from "@/lib/types";

export default function ComparePage() {
  const [catalog, setCatalog] = useState<Model[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/models?pageSize=50&sort=popularity")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load model options.");
        const data = await response.json() as { models: Model[] };
        setCatalog(data.models);
        const saved = readSlugs("oneatlas:compare");
        const requested = new URLSearchParams(window.location.search).get("model");
        const validSlugs = new Set(data.models.map((model) => model.slug));
        const candidates = [...(requested ? [requested] : []), ...saved.slice(-3), ...data.models.map((model) => model.slug)];
        const initial = [...new Set(candidates.filter((slug) => validSlugs.has(slug)))].slice(0, 3);
        setSelected(initial);
        localStorage.setItem("oneatlas:compare", JSON.stringify(initial));
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load model options."))
      .finally(() => setCatalogLoading(false));
  }, []);

  useEffect(() => {
    const slugs = selected.filter(Boolean);
    if (catalogLoading || slugs.length < 3) return;
    let active = true;
    fetch(`/api/compare?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to compare these models.");
        return await response.json() as { models: Model[] };
      })
      .then((data) => { if (active) setModels(data.models); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to compare models."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected, catalogLoading]);

  function choose(index: number, slug: string) {
    const next = [...selected];
    if (slug && next.some((item, current) => item === slug && current !== index)) return;
    next[index] = slug;
    setLoading(next.filter(Boolean).length >= 3);
    setError("");
    setSelected(next);
    localStorage.setItem("oneatlas:compare", JSON.stringify(next.filter(Boolean)));
  }

  const rows: { label: string; render: (model: Model) => React.ReactNode }[] = [
    { label: "Provider", render: (model) => <span className="provider-inline"><ProviderMark name={model.providerName} color={model.providerColor} />{model.providerName}</span> },
    { label: "Input price / 1M", render: (model) => <strong>${model.inputPrice.toFixed(2)}</strong> },
    { label: "Output price / 1M", render: (model) => <strong>${model.outputPrice.toFixed(2)}</strong> },
    { label: "Context window", render: (model) => <strong>{formatContext(model.contextWindow)} tokens</strong> },
    { label: "Max output", render: (model) => <strong>{formatContext(model.maxOutputTokens)} tokens</strong> },
    { label: "Speed score", render: (model) => <span className="comparison-score">{model.speedScore}<small> / 100</small></span> },
    { label: "Popularity", render: (model) => <span className="comparison-score">{model.popularity}<small> / 100</small></span> },
    { label: "MMLU", render: (model) => <span className="comparison-score">{model.benchmarks.mmlu}<small>%</small></span> },
    { label: "HumanEval", render: (model) => <span className="comparison-score">{model.benchmarks.humanEval}<small>%</small></span> },
    { label: "SWE-bench", render: (model) => <span className="comparison-score">{model.benchmarks.sweBench}<small>%</small></span> },
    { label: "GPQA", render: (model) => <span className="comparison-score">{model.benchmarks.gpqa}<small>%</small></span> },
    { label: "Capabilities", render: (model) => <span className="comparison-tags">{model.capabilities.slice(0, 4).map((item) => <span className="tag" key={item}>{item}</span>)}</span> },
    { label: "Modalities", render: (model) => <span>{model.modalities.join(", ")}</span> },
  ];

  return (
    <div>
      <PageHeading eyebrow="SIDE BY SIDE" title="Compare models" description="Make a confident call with pricing, context, and benchmark data in one view." action={<span className="compare-limit"><GitCompareArrows size={15} /> Three-model comparison</span>} />
      {catalogLoading ? <LoadingState label="Preparing model selectors…" /> : error && !catalog.length ? <ErrorState message={error} /> : (
        <>
          <section className="compare-selector-grid">
            {[0, 1, 2].map((index) => <label className="compare-select-card" key={index}><span className="compare-select-index">0{index + 1}</span><span className="field-label">Model {index + 1}</span><select className="field-control" value={selected[index] ?? ""} onChange={(event) => choose(index, event.target.value)}><option value="">Select a model</option>{catalog.map((model) => <option value={model.slug} key={model.slug} disabled={selected.includes(model.slug) && selected[index] !== model.slug}>{model.name} · {model.providerName}</option>)}</select></label>)}
          </section>
          {loading ? <LoadingState label="Building comparison…" /> : error ? <ErrorState message={error} /> : selected.filter(Boolean).length >= 3 && models.length >= 3 ? (
            <section className="panel comparison-panel">
              <div className="comparison-header"><div className="comparison-label"><Scale size={17} /><span>Comparison overview</span></div><span className="sample-badge">Sample benchmark scores</span></div>
              <div className="comparison-table">
                <div className="comparison-row comparison-model-row"><div className="comparison-name-col">Model</div>{models.map((model) => <div className="comparison-value-col compare-model-heading" key={model.slug}><ProviderMark name={model.providerName} color={model.providerColor} /><div><Link href={`/models/${model.slug}`}><strong>{model.name}</strong></Link><small>{model.providerName}</small></div></div>)}</div>
                {rows.map((row) => <div className="comparison-row" key={row.label}><div className="comparison-name-col">{row.label}</div>{models.map((model) => <div className="comparison-value-col" key={model.slug}>{row.render(model)}</div>)}</div>)}
              </div>
              <p className="table-disclaimer">Demo catalog values are illustrative and are not verified live provider pricing or benchmark results.</p>
            </section>
          ) : <div className="empty-results"><strong>Choose at least three models</strong><p>Use the selectors above to build a side-by-side comparison.</p><span className="text-action"><Plus size={14} /> Select three to continue <ArrowRight size={14} /></span></div>}
        </>
      )}
    </div>
  );
}
