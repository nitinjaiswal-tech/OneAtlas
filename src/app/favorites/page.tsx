"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark } from "lucide-react";
import { ErrorState, LoadingState, ModelCard, PageHeading, readSlugs } from "@/components/ui";
import type { Model } from "@/lib/types";

export default function FavoritesPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let catalog: Model[] = [];
    let active = true;
    const updateFavorites = () => {
      const favorites = readSlugs("oneatlas:favorites");
      setModels(favorites.map((slug) => catalog.find((model) => model.slug === slug)).filter((model): model is Model => Boolean(model)));
    };
    fetch("/api/models?pageSize=50")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load your saved models.");
        const data = await response.json() as { models: Model[] };
        if (!active) return;
        catalog = data.models;
        updateFavorites();
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load saved models."); })
      .finally(() => { if (active) setLoading(false); });
    window.addEventListener("favorites-changed", updateFavorites);
    return () => { active = false; window.removeEventListener("favorites-changed", updateFavorites); };
  }, []);

  return <div><PageHeading eyebrow="YOUR SHORTLIST" title="Favorites" description="Models you've bookmarked for a closer look." action={<Bookmark size={18} className="muted-icon" />} />
    {error ? <ErrorState message={error} /> : loading ? <LoadingState label="Loading favorites…" /> : models.length ? <section className="model-grid">{models.map((model) => <ModelCard key={model.slug} model={model} />)}</section> : <div className="empty-results"><div className="empty-state-icon"><Bookmark size={19} /></div><strong>No favorites yet</strong><p>Save models from the explorer to keep your shortlist close.</p><Link className="button button-primary" href="/models">Explore models <ArrowRight size={15} /></Link></div>}
  </div>;
}
