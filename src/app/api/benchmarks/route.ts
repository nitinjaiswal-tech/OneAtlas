import { NextResponse } from "next/server";
import { benchmarkLabels } from "@/lib/demo-data";
import { getModels } from "@/lib/data";

export async function GET() {
  try {
    const allModels = await getModels();
    const results = Object.entries(benchmarkLabels).map(([key, name]) => ({
      key,
      name,
      models: [...allModels]
        .sort((a, b) => b.benchmarks[key as keyof typeof a.benchmarks] - a.benchmarks[key as keyof typeof b.benchmarks])
        .slice(0, 5)
        .map((model) => ({ slug: model.slug, name: model.name, providerName: model.providerName, score: model.benchmarks[key as keyof typeof model.benchmarks] })),
    }));
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/benchmarks failed", error);
    return NextResponse.json({ error: "Could not load benchmarks" }, { status: 500 });
  }
}
