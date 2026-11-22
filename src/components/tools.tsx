"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Sparkles } from "lucide-react";
import type { Model } from "@/lib/types";
import { formatContext, ProviderMark } from "@/components/ui";

export function CostCalculator({ models }: { models: Model[] }) {
  const [slug, setSlug] = useState(models[0]?.slug ?? "");
  const [inputTokens, setInputTokens] = useState("100000");
  const [outputTokens, setOutputTokens] = useState("25000");
  const model = models.find((item) => item.slug === slug) ?? models[0];
  const input = Math.max(0, Number(inputTokens) || 0);
  const output = Math.max(0, Number(outputTokens) || 0);
  const estimate = model ? (input * model.inputPrice + output * model.outputPrice) / 1_000_000 : 0;

  if (!model) return null;
  return (
    <section className="panel tool-panel">
      <div className="panel-heading"><div className="panel-icon"><Calculator size={16} /></div><div><h3>Cost calculator</h3><p>Estimate spend at demo list rates.</p></div></div>
      <label className="field-label" htmlFor="calculator-model">Model</label>
      <select id="calculator-model" className="field-control" value={slug} onChange={(event) => setSlug(event.target.value)}>{models.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select>
      <div className="field-grid">
        <label><span className="field-label">Input tokens</span><input className="field-control" type="number" min="0" value={inputTokens} onChange={(event) => setInputTokens(event.target.value)} /></label>
        <label><span className="field-label">Output tokens</span><input className="field-control" type="number" min="0" value={outputTokens} onChange={(event) => setOutputTokens(event.target.value)} /></label>
      </div>
      <div className="estimate-box"><div><span>Estimated total</span><small>Based on your token volume</small></div><strong>${estimate.toFixed(4)}</strong></div>
      <p className="tool-disclaimer">Demo estimate only. Provider prices and billing may vary.</p>
    </section>
  );
}

export function SmartFinder({ models, compact = false }: { models: Model[]; compact?: boolean }) {
  const [budget, setBudget] = useState("2");
  const [task, setTask] = useState("any");
  const [context, setContext] = useState("0");
  const [capabilities, setCapabilities] = useState<string[]>([]);

  const recommended = useMemo(() => models
    .filter((model) => model.inputPrice <= (Number(budget) || 0))
    .filter((model) => Number(context) === 0 || model.contextWindow >= Number(context))
    .filter((model) => task === "any" || model.category === task || (task === "coding" && model.capabilities.includes("Coding")) || (task === "reasoning" && model.capabilities.includes("Reasoning")))
    .filter((model) => capabilities.every((capability) => model.capabilities.includes(capability)))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3), [models, budget, task, context, capabilities]);

  return (
    <section className={`panel finder-panel ${compact ? "finder-panel-compact" : ""}`}>
      <div className="panel-heading"><div className="panel-icon accent-icon"><Sparkles size={16} /></div><div><h3>Smart model finder</h3><p>Find a fit for your workload and budget.</p></div></div>
      <div className="finder-fields">
        <label><span className="field-label">Max input price / 1M</span><div className="input-prefix"><span>$</span><input className="field-control" type="number" min="0" step="0.1" value={budget} onChange={(event) => setBudget(event.target.value)} /></div></label>
        <label><span className="field-label">Task type</span><select className="field-control" value={task} onChange={(event) => setTask(event.target.value)}><option value="any">Any task</option><option value="coding">Coding</option><option value="reasoning">Reasoning</option><option value="multimodal">Multimodal</option><option value="chat">Chat & writing</option></select></label>
        <label><span className="field-label">Minimum context</span><select className="field-control" value={context} onChange={(event) => setContext(event.target.value)}><option value="0">Any context</option><option value="32000">32K tokens</option><option value="128000">128K tokens</option><option value="1000000">1M tokens</option></select></label>
        <fieldset className="finder-capabilities"><legend className="field-label">Required capabilities</legend><div className="capability-checks">{["Reasoning", "Coding", "Vision", "Tool use", "RAG"].map((item) => <label key={item}><input type="checkbox" checked={capabilities.includes(item)} onChange={(event) => setCapabilities((current) => event.target.checked ? [...current, item] : current.filter((value) => value !== item))} /><span>{item}</span></label>)}</div></fieldset>
      </div>
      <div className="finder-results">
        <div className="finder-results-head"><span>Recommended matches</span><span>{recommended.length} found</span></div>
        {recommended.length ? recommended.map((model) => (
          <a className="recommendation-row" href={`/models/${model.slug}`} key={model.slug}>
            <ProviderMark name={model.providerName} color={model.providerColor} />
            <span className="recommendation-name"><strong>{model.name}</strong><small>{model.providerName} · {formatContext(model.contextWindow)} context</small></span>
            <span className="recommendation-price">${model.inputPrice.toFixed(2)}<small>/ 1M</small></span><ArrowRight size={14} className="muted-icon" />
          </a>
        )) : <p className="no-results">No matches found. Try increasing your budget or lowering context.</p>}
      </div>
    </section>
  );
}
