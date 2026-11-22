"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import { ErrorState, LoadingState, ModelCard, PageHeading } from "@/components/ui";
import type { Model, ModelListResponse, Provider } from "@/lib/types";

export default function ModelsPage() {
  return <Suspense fallback={<LoadingState label="Loading model catalog…" />}><ModelsRoute /></Suspense>;
}

function ModelsRoute() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort");
  const initialSort = sort === "inputPrice" || sort === "contextWindow" || sort === "speedScore" ? sort : "popularity";
  const query = searchParams.toString();
  return <ModelsExplorer key={query} initialSearch={searchParams.get("search") ?? ""} initialSort={initialSort} />;
}

function ModelsExplorer({ initialSearch, initialSort }: { initialSearch: string; initialSort: string }) {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [provider, setProvider] = useState("");
  const [capability, setCapability] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minContext, setMinContext] = useState("");
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      const params = new URLSearchParams({ page: String(page), pageSize: "9", sort });
      if (search.trim()) params.set("search", search.trim());
      if (provider) params.set("provider", provider);
      if (capability) params.set("capability", capability);
      if (category) params.set("category", category);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minContext) params.set("minContext", minContext);
      try {
        const response = await fetch(`/api/models?${params.toString()}`);
        if (!response.ok) throw new Error("Unable to load models. Please try again.");
        const data = await response.json() as ModelListResponse;
        if (active) {
          setModels(data.models);
          setTotal(data.total);
          setError("");
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load models.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [page, sort, search, provider, capability, category, maxPrice, minContext, retryKey]);
  useEffect(() => {
    fetch("/api/providers").then((response) => response.ok ? response.json() as Promise<Provider[]> : Promise.reject(new Error("Providers unavailable"))).then(setProviders).catch(() => setProviders([]));
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / 9));
  const activeFilters = useMemo(() => [provider, capability, category, maxPrice, minContext].filter(Boolean).length, [provider, capability, category, maxPrice, minContext]);

  function clearFilters() {
    setLoading(true);
    setError("");
    setProvider(""); setCapability(""); setCategory(""); setMaxPrice(""); setMinContext(""); setPage(1);
  }

  function clearSearchAndFilters() {
    setLoading(true);
    setError("");
    setSearch("");
    setProvider(""); setCapability(""); setCategory(""); setMaxPrice(""); setMinContext(""); setPage(1);
    router.replace("/models");
  }

  function filterChange(setter: (value: string) => void, value: string) {
    setLoading(true);
    setError("");
    setter(value);
    setPage(1);
  }

  function retry() {
    setLoading(true);
    setError("");
    setRetryKey((value) => value + 1);
  }

  return (
    <div>
      <PageHeading eyebrow="THE MODEL CATALOG" title="Explore models" description="Search, filter, and find the right model for what you’re building." action={<span className="catalog-count"><strong>{loading && total === 0 ? "—" : total}</strong> models indexed</span>} />
      <section className="explorer-toolbar panel">
        <label className="explorer-search"><Search size={16} /><input value={search} onChange={(event) => filterChange(setSearch, event.target.value)} placeholder="Search by model or provider..." aria-label="Search model catalog" /></label>
        <div className="filter-row">
          <label className="select-filter"><span>Provider</span><select value={provider} onChange={(event) => filterChange(setProvider, event.target.value)}><option value="">All providers</option>{providers.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label className="select-filter"><span>Capability</span><select value={capability} onChange={(event) => filterChange(setCapability, event.target.value)}><option value="">Any capability</option>{["Reasoning", "Coding", "Vision", "Tool use", "Open weights", "RAG"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="select-filter"><span>Max input / 1M</span><select value={maxPrice} onChange={(event) => filterChange(setMaxPrice, event.target.value)}><option value="">Any price</option><option value="0.5">Up to $0.50</option><option value="1">Up to $1</option><option value="3">Up to $3</option><option value="10">Up to $10</option></select></label>
          <label className="select-filter"><span>Context</span><select value={minContext} onChange={(event) => filterChange(setMinContext, event.target.value)}><option value="">Any context</option><option value="32000">32K+</option><option value="128000">128K+</option><option value="1000000">1M+</option></select></label>
          <label className="select-filter"><span>Model type</span><select value={category} onChange={(event) => filterChange(setCategory, event.target.value)}><option value="">All types</option><option value="reasoning">Reasoning</option><option value="coding">Coding</option><option value="multimodal">Multimodal</option><option value="chat">Chat</option></select></label>
          <label className="select-filter sort-filter"><span>Sort by</span><select value={sort} onChange={(event) => filterChange(setSort, event.target.value)}><option value="popularity">Popularity</option><option value="inputPrice">Price: low first</option><option value="contextWindow">Context length</option><option value="speedScore">Speed</option></select></label>
        </div>
        <div className="toolbar-bottom"><span className="active-filter-note"><SlidersHorizontal size={13} />{activeFilters ? `${activeFilters} filters active` : "Filters update results instantly"}{activeFilters > 0 && <button onClick={clearFilters}>Clear <X size={12} /></button>}</span><div className="view-switch" aria-label="View mode"><button className={view === "grid" ? "view-active" : ""} aria-label="Grid view" onClick={() => setView("grid")}><Grid2X2 size={15} /></button><button className={view === "list" ? "view-active" : ""} aria-label="List view" onClick={() => setView("list")}><List size={16} /></button></div></div>
      </section>
      {error ? <ErrorState message={error} retry={retry} /> : loading ? <LoadingState label="Searching the model catalog…" /> : models.length ? (
        <>
          <div className="results-caption"><span>Showing <strong>{(page - 1) * 9 + 1}–{Math.min(page * 9, total)}</strong> of <strong>{total}</strong> models</span><span>Prices shown are illustrative demo data</span></div>
          <section className={`model-grid ${view === "list" ? "model-list-view" : ""}`}>{models.map((model) => <ModelCard key={model.slug} model={model} compact={view === "list"} />)}</section>
          <div className="pagination"><button className="button button-secondary" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Previous</button><span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span><button className="button button-secondary" disabled={page >= pageCount} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next</button></div>
        </>
      ) : <div className="empty-results"><strong>No models match those filters</strong><p>Try a different search or clear some filters.</p><button className="button button-secondary" onClick={clearSearchAndFilters}>Clear search &amp; filters</button></div>}
    </div>
  );
}
