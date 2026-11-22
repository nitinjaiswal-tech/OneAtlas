"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { ErrorState, LoadingState, ModelCard, ProviderMark } from "@/components/ui";
import type { Model, Provider } from "@/lib/types";

type ProviderDetail = Provider & { models: Model[] };

export default function ProviderDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => { void params.then(({ slug: providerSlug }) => setSlug(providerSlug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/providers/${slug}`);
        if (!response.ok) throw new Error(response.status === 404 ? "This provider could not be found." : "Unable to load provider profile.");
        const data = await response.json() as ProviderDetail;
        if (active) { setProvider(data); setError(""); }
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Unable to load provider profile."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [slug, retryKey]);

  if (loading) return <LoadingState label="Loading provider profile…" />;
  if (error || !provider) return <ErrorState message={error || "Provider not found."} retry={() => { setLoading(true); setError(""); setRetryKey((value) => value + 1); }} />;
  return <div>
    <Link href="/providers" className="back-link"><ArrowLeft size={14} /> Back to providers</Link>
    <div className="provider-profile panel"><ProviderMark name={provider.name} color={provider.color} size="large" /><div className="provider-profile-main"><p className="eyebrow">MODEL PROVIDER</p><h1>{provider.name}</h1><p>{provider.description}</p><div className="provider-location"><MapPin size={14} />{provider.headquarters}</div></div><div className="provider-profile-count"><strong>{provider.models.length.toString().padStart(2, "0")}</strong><span>models indexed</span></div></div>
    <div className="section-title-row provider-model-title"><div><p className="eyebrow">CATALOG</p><h2>Models from {provider.name}</h2></div><Link className="panel-link" href="/models">Explore all models <ArrowRight size={14} /></Link></div>
    {provider.models.length ? <section className="model-grid">{provider.models.map((model) => <ModelCard key={model.slug} model={model} />)}</section> : <div className="empty-results"><strong>No models in this catalog yet</strong><p>Check back as OneAtlas expands its demo dataset.</p></div>}
  </div>;
}
