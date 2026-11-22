"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { ErrorState, LoadingState, PageHeading, ProviderMark } from "@/components/ui";
import type { Provider } from "@/lib/types";

type ProviderWithCount = Provider & { modelCount: number };

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ProviderWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/providers")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load provider directory.");
        return await response.json() as ProviderWithCount[];
      })
      .then((data) => { if (active) { setProviders(data); setError(""); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load providers."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryKey]);
  function retry() {
    setLoading(true);
    setError("");
    setRetryKey((value) => value + 1);
  }

  return (
    <div>
      <PageHeading eyebrow="THE ECOSYSTEM" title="AI providers" description="Explore the labs and platforms building today's most capable models." action={<span className="catalog-count"><strong>{providers.length || 10}</strong> providers</span>} />
      {error ? <ErrorState message={error} retry={retry} /> : loading ? <LoadingState label="Loading providers…" /> : (
        <section className="provider-grid">{providers.map((provider) => <Link className="provider-card panel" href={`/providers/${provider.slug}`} key={provider.slug}>
          <div className="provider-card-top"><ProviderMark name={provider.name} color={provider.color} size="large" /><span className="provider-count">{provider.modelCount} models</span></div>
          <h2>{provider.name}</h2><p>{provider.description}</p>
          <div className="provider-card-foot"><span><MapPin size={13} />{provider.headquarters}</span><span className="provider-open">View provider <ArrowRight size={14} /></span></div>
        </Link>)}</section>
      )}
      {!loading && !error && <div className="providers-note"><Building2 size={15} /><span>Provider profiles and model counts are based on the OneAtlas demo catalog.</span></div>}
    </div>
  );
}
