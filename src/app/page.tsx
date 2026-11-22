"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Boxes, Building2, CircleDollarSign, Clock3, Sparkles, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CostCalculator } from "@/components/tools";
import { ModelCard, ErrorState, LoadingState, PageHeading, StatCard } from "@/components/ui";
import type { Model, ModelListResponse, Provider } from "@/lib/types";

export default function DashboardPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [modelResponse, providerResponse] = await Promise.all([fetch("/api/models?pageSize=50&sort=popularity"), fetch("/api/providers")]);
        if (!modelResponse.ok || !providerResponse.ok) throw new Error("The catalog could not be loaded.");
        const [modelData, providerData] = await Promise.all([modelResponse.json() as Promise<ModelListResponse>, providerResponse.json() as Promise<Provider[]>]);
        if (active) {
          setModels(modelData.models);
          setProviders(providerData);
          setError("");
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "The catalog could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [refreshKey]);
  function retry() {
    setLoading(true);
    setError("");
    setRefreshKey((value) => value + 1);
  }

  const cheapest = useMemo(() => [...models].sort((a, b) => a.inputPrice - b.inputPrice).slice(0, 5), [models]);
  const recent = useMemo(() => [...models].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)).slice(0, 4), [models]);
  const featured = models.slice(0, 3);
  const chartData = useMemo(() => [...models].sort((a, b) => a.inputPrice - b.inputPrice).slice(0, 8).map((model) => ({ name: model.name.replace(/ (?:2\.5|2\.0|4\.1|4o)/g, ""), input: model.inputPrice, output: model.outputPrice })), [models]);

  return (
    <div className="dashboard-page">
      <PageHeading eyebrow="MODEL INTELLIGENCE PLATFORM" title="Model intelligence, at a glance." description="A clearer view of the models shaping what you can build." action={<span className="demo-badge"><span />Demo dataset</span>} />
      {error ? <ErrorState message={error} retry={retry} /> : loading ? <LoadingState label="Loading model intelligence…" /> : (
        <>
          <section className="stats-grid">
            <StatCard label="Models tracked" value={String(models.length).padStart(2, "0")} note="Across all model families" icon={Boxes} />
            <StatCard label="Providers" value={String(providers.length).padStart(2, "0")} note="Leading labs & platforms" icon={Building2} />
            <StatCard label="Lowest input price" value={`$${Math.min(...models.map((model) => model.inputPrice)).toFixed(2)}`} note="Per million input tokens" icon={CircleDollarSign} />
            <StatCard label="Fastest model" value={`${Math.max(...models.map((model) => model.speedScore))}`} note="Relative speed score" icon={Zap} />
          </section>

          <div className="dashboard-feature-grid">
            <section className="panel chart-panel">
              <div className="panel-heading panel-heading-spread">
                <div><p className="eyebrow">MARKET SNAPSHOT</p><h2>Model pricing</h2><p>Input and output price per million tokens</p></div>
                <Link className="panel-link" href="/models">Explore catalog <ArrowRight size={14} /></Link>
              </div>
              <div className="chart-legend"><span><i className="legend-dot legend-input" />Input price</span><span><i className="legend-dot legend-output" />Output price</span><span className="chart-unit">USD / 1M tokens</span></div>
              <div className="price-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -20 }} barGap={5}>
                    <CartesianGrid stroke="#20252c" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#858c98", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis tick={{ fill: "#858c98", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value: number) => `$${value}`} />
                    <Tooltip contentStyle={{ background: "#15191e", border: "1px solid #2a3038", borderRadius: 9, color: "#f2f3f5" }} formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                    <Bar dataKey="input" name="Input" fill="#77d5ba" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="output" name="Output" fill="#646df2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-note">Pricing is illustrative demo data and may not reflect current provider rates.</p>
            </section>
            <section className="panel cheapest-panel">
              <div className="panel-heading panel-heading-spread"><div><p className="eyebrow">COST EFFICIENT</p><h2>Low-cost picks</h2></div><Link className="icon-link" href="/models?sort=inputPrice" aria-label="View all models"><ArrowUpRight size={17} /></Link></div>
              <div className="cheapest-list">
                {cheapest.slice(0, 5).map((model, index) => <Link className="cheap-row" href={`/models/${model.slug}`} key={model.slug}>
                  <span className="cheap-rank">{String(index + 1).padStart(2, "0")}</span><span className="cheap-name"><strong>{model.name}</strong><small>{model.providerName}</small></span><strong className="cheap-price">${model.inputPrice.toFixed(2)}<small>/ 1M</small></strong>
                </Link>)}
              </div>
              <Link className="subtle-link" href="/models?sort=inputPrice">See all affordable models <ArrowRight size={14} /></Link>
            </section>
          </div>

          <div className="section-title-row"><div><p className="eyebrow">CURATED & RISING</p><h2>Featured & trending models</h2></div><Link href="/models" className="panel-link">View all models <ArrowRight size={14} /></Link></div>
          <section className="model-grid model-grid-featured">{featured.map((model) => <ModelCard key={model.slug} model={model} />)}</section>

          <div className="dashboard-bottom-grid">
            <section className="panel recent-panel">
              <div className="panel-heading panel-heading-spread"><div><p className="eyebrow">FRESH IN THE CATALOG</p><h2>Recently added</h2></div><Clock3 size={17} className="muted-icon" /></div>
              <div className="recent-list">{recent.map((model) => <Link className="recent-row" href={`/models/${model.slug}`} key={model.slug}>
                <span className="recent-provider" style={{ backgroundColor: `${model.providerColor}18`, color: model.providerColor }}>{model.providerName.slice(0, 1)}</span>
                <span className="recent-name"><strong>{model.name}</strong><small>{model.providerName} · {new Date(`${model.releaseDate}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</small></span><ArrowRight size={14} className="muted-icon" />
              </Link>)}</div>
            </section>
            <CostCalculator models={models} />
          </div>
          <div className="dashboard-discovery-cta">
            <div className="cta-icon"><Sparkles size={18} /></div><div><strong>Not sure where to start?</strong><span>Tell us what you’re building and get a shortlist that fits.</span></div><Link className="button button-primary" href="/finder">Find a model <ArrowRight size={15} /></Link>
          </div>
        </>
      )}
    </div>
  );
}
