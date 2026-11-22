"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, CircleDollarSign, ExternalLink, Gauge, Layers3, Zap } from "lucide-react";
import { ErrorState, LoadingState, ProviderMark, formatContext } from "@/components/ui";
import type { Model } from "@/lib/types";

export default function ModelDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => { void params.then(({ slug: modelSlug }) => setSlug(modelSlug)); }, [params]);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/models/${slug}`);
        if (!response.ok) throw new Error(response.status === 404 ? "This model could not be found." : "Unable to load model details.");
        const data = await response.json() as Model;
        if (active) { setModel(data); setError(""); }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load model details.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [slug, retryKey]);

  if (loading) return <LoadingState label="Loading model details…" />;
  if (error || !model) return <ErrorState message={error || "Model not found."} retry={() => { setLoading(true); setError(""); setRetryKey((value) => value + 1); }} />;

  return (
    <div>
      <Link href="/models" className="back-link"><ArrowLeft size={14} /> Back to models</Link>
      <div className="detail-hero panel">
        <div className="detail-main">
          <ProviderMark name={model.providerName} color={model.providerColor} size="large" />
          <div><p className="eyebrow">{model.providerName.toUpperCase()} · {model.version}</p><h1>{model.name}</h1><p className="detail-description">{model.description}</p><div className="model-tags">{model.capabilities.filter((tag) => !(model.openSource && tag === "Open weights")).map((tag) => <span className="tag" key={tag}>{tag}</span>)}{model.openSource && <span className="tag tag-green">Open weights</span>}</div></div>
        </div>
        <div className="detail-hero-badges"><span className="demo-badge"><span />Demo data</span><span className="availability"><i />Listed for evaluation</span></div>
      </div>
      <div className="detail-stat-grid">
        <div className="detail-stat"><CircleDollarSign size={17} /><span>Input price</span><strong>${model.inputPrice.toFixed(2)}<small> / 1M tokens</small></strong></div>
        <div className="detail-stat"><CircleDollarSign size={17} /><span>Output price</span><strong>${model.outputPrice.toFixed(2)}<small> / 1M tokens</small></strong></div>
        <div className="detail-stat"><Layers3 size={17} /><span>Context window</span><strong>{formatContext(model.contextWindow)}<small> tokens</small></strong></div>
        <div className="detail-stat"><Zap size={17} /><span>Max output</span><strong>{formatContext(model.maxOutputTokens)}<small> tokens</small></strong></div>
      </div>
      <div className="details-content-grid">
        <section className="panel detail-section">
          <div className="section-title-row"><div><p className="eyebrow">MODEL PROFILE</p><h2>Specifications</h2></div><Gauge size={17} className="muted-icon" /></div>
          <dl className="spec-list">
            <div><dt>Provider</dt><dd><Link href={`/providers/${model.providerSlug}`} className="provider-inline"><ProviderMark name={model.providerName} color={model.providerColor} />{model.providerName}<ArrowUpRight size={13} /></Link></dd></div>
            <div><dt>Model version</dt><dd>{model.version}</dd></div>
            <div><dt>Category</dt><dd>{model.category.charAt(0).toUpperCase() + model.category.slice(1)}</dd></div>
            <div><dt>Released</dt><dd>{new Date(`${model.releaseDate}T00:00:00`).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</dd></div>
            <div><dt>Modalities</dt><dd className="spec-chips">{model.modalities.map((item) => <span key={item}>{item}</span>)}</dd></div>
            <div><dt>Availability</dt><dd><span className="availability"><i />Pricing is a demo estimate</span></dd></div>
          </dl>
          <p className="disclaimer-box"><ExternalLink size={14} /> Pricing and benchmark data in this demo has not been verified against live provider sources.</p>
        </section>
        <section className="panel detail-section benchmark-section">
          <div className="section-title-row"><div><p className="eyebrow">SAMPLE SCORES</p><h2>Benchmarks</h2></div><span className="sample-badge">Demo only</span></div>
          {Object.entries({ MMLU: model.benchmarks.mmlu, HumanEval: model.benchmarks.humanEval, "SWE-bench": model.benchmarks.sweBench, GPQA: model.benchmarks.gpqa }).map(([label, score]) => <div className="benchmark-line" key={label}>
            <div><span>{label}</span><strong>{score}<small>%</small></strong></div><div className="benchmark-track"><span style={{ width: `${score}%` }} /></div>
          </div>)}
          <p className="chart-note">Sample scores included to demonstrate comparison. They are not verified evaluations.</p>
        </section>
      </div>
      <div className="model-detail-actions"><Link href={`/compare?model=${model.slug}`} className="button button-primary"><Check size={15} />Compare this model</Link><Link href="/models" className="button button-secondary">Browse more models</Link></div>
    </div>
  );
}
