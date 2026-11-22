"use client";

import { useEffect, useState } from "react";
import { ErrorState, LoadingState, PageHeading } from "@/components/ui";
import { SmartFinder } from "@/components/tools";
import type { Model, ModelListResponse } from "@/lib/types";

export default function FinderPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/models?pageSize=50&sort=popularity")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to prepare model recommendations.");
        setModels((await response.json() as ModelListResponse).models);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to prepare recommendations."))
      .finally(() => setLoading(false));
  }, []);

  return <div><PageHeading eyebrow="A BETTER WAY TO CHOOSE" title="Find your model" description="Set your constraints. We'll shortlist models that fit your budget, task, and context needs." />
    <div className="finder-page-layout"><div>{error ? <ErrorState message={error} /> : loading ? <LoadingState label="Loading model catalog…" /> : <SmartFinder models={models} />}</div><aside className="panel finder-aside"><div className="finder-aside-icon">i</div><h3>How recommendations work</h3><p>We match the input price, context window, task category, and capabilities you select against the demo catalog.</p><ul><li>Pricing is illustrative, not live</li><li>Scores are sample values</li><li>Always confirm details with providers</li></ul></aside></div>
  </div>;
}
