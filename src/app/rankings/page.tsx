"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState, LoadingState, PageHeading, ProviderMark } from "@/components/ui";
import type { Model } from "@/lib/types";

const categories = [
  { key: "overall", label: "Overall" },
  { key: "coding", label: "Coding" },
  { key: "reasoning", label: "Reasoning" },
  { key: "speed", label: "Speed" },
  { key: "value", label: "Cost efficiency" },
] as const;
type RankingCategory = (typeof categories)[number]["key"];
type RankedModel = Model & { score: number };
type BenchmarkResult = { key: string; name: string; models: { slug: string; name: string; providerName: string; score: number }[] };

export default function RankingsPage() {
  const [category, setCategory] = useState<RankingCategory>("overall");
  const [models, setModels] = useState<RankedModel[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [rankResponse, benchmarkResponse] = await Promise.all([fetch(`/api/rankings?category=${category}`), fetch("/api/benchmarks")]);
        if (!rankResponse.ok || !benchmarkResponse.ok) throw new Error("Unable to load model rankings.");
        const rankData = await rankResponse.json() as { models: RankedModel[] };
        const benchmarkData = await benchmarkResponse.json() as BenchmarkResult[];
        if (active) {
          setModels(rankData.models);
          setBenchmarks(benchmarkData);
          setError("");
        }
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Unable to load rankings."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [category, retryKey]);
  function selectCategory(next: RankingCategory) {
    setLoading(true);
    setError("");
    setCategory(next);
  }

  return (
    <div>
      <PageHeading eyebrow="PERFORMANCE INDEX" title="Model rankings" description="A practical leaderboard across performance, speed, and cost efficiency." action={<span className="sample-badge">Demo scores · Not verified</span>} />
      <div className="ranking-tabs" role="tablist" aria-label="Ranking category">{categories.map((item) => <button key={item.key} role="tab" aria-selected={category === item.key} className={category === item.key ? "ranking-tab-active" : ""} onClick={() => selectCategory(item.key)}>{item.label}</button>)}</div>
      {error ? <ErrorState message={error} retry={() => { setLoading(true); setError(""); setRetryKey((value) => value + 1); }} /> : loading ? <LoadingState label="Calculating rankings…" /> : (
        <>
          <div className="ranking-feature-grid">
            <section className="panel leaderboard-panel">
              <div className="panel-heading panel-heading-spread"><div><p className="eyebrow">LEADERBOARD</p><h2>{categories.find((item) => item.key === category)?.label} leaders</h2><p>Relative score based on demo data</p></div><Trophy size={18} className="trophy-icon" /></div>
              <div className="leaderboard-list">{models.map((model, index) => <div className={`leaderboard-row ${index === 0 ? "leaderboard-first" : ""}`} key={model.slug}>
                <span className="leaderboard-rank">{String(index + 1).padStart(2, "0")}</span><ProviderMark name={model.providerName} color={model.providerColor} /><span className="leaderboard-model"><Link href={`/models/${model.slug}`}><strong>{model.name}</strong></Link><small>{model.providerName}</small></span><div className="leaderboard-score"><strong>{model.score}</strong><span>score</span></div><div className="score-progress"><span style={{ width: `${Math.min(100, model.score)}%` }} /></div>
              </div>)}</div>
            </section>
            <section className="panel ranking-chart-panel">
              <div className="panel-heading"><div><p className="eyebrow">MODEL SCORES</p><h2>Relative performance</h2></div><BarChart3 size={17} className="muted-icon" /></div>
              <div className="ranking-chart">
                <ResponsiveContainer width="100%" height="100%"><BarChart data={models.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke="#20252c" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "#858c98", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={95} tick={{ fill: "#a7adb7", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#15191e", border: "1px solid #2a3038", borderRadius: 9, color: "#f2f3f5" }} />
                  <Bar dataKey="score" fill="#77d5ba" radius={[0, 5, 5, 0]} barSize={14} />
                </BarChart></ResponsiveContainer>
              </div>
              <p className="chart-note">Scores are relative sample values for demo and comparison purposes only.</p>
            </section>
          </div>
          <section className="benchmark-overview">
            <div className="section-title-row"><div><p className="eyebrow">TASK-SPECIFIC RESULTS</p><h2>Benchmark leaders</h2></div><span className="sample-badge">Demo scores</span></div>
            <div className="benchmark-cards">{benchmarks.map((benchmark) => <div className="panel benchmark-card" key={benchmark.key}><div className="benchmark-card-title"><span>{benchmark.name}</span><span className="benchmark-unit">%</span></div>{benchmark.models.slice(0, 3).map((item, index) => <Link className="benchmark-leader" href={`/models/${item.slug}`} key={item.slug}><span className="benchmark-place">{index + 1}</span><span>{item.name}</span><strong>{item.score}</strong></Link>)}<Link href="/models" className="benchmark-more">Explore models <ArrowRight size={13} /></Link></div>)}</div>
          </section>
        </>
      )}
    </div>
  );
}
