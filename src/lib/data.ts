import { models, providers } from "@/lib/demo-data";
import type { Model, Provider } from "@/lib/types";

function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getModels(): Promise<Model[]> {
  if (!isDatabaseEnabled()) return models;
  const { prisma } = await import("@/lib/db");
  const rows = await prisma.model.findMany({
    include: { provider: true, capabilities: { include: { capability: true } }, benchmarks: { include: { benchmark: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    providerSlug: row.provider.slug,
    providerName: row.provider.name,
    providerColor: row.provider.color,
    description: row.description,
    version: row.version,
    inputPrice: row.inputPrice,
    outputPrice: row.outputPrice,
    contextWindow: row.contextWindow,
    maxOutputTokens: row.maxOutputTokens,
    modalities: row.modalities,
    capabilities: row.capabilities.map(({ capability }) => capability.name),
    openSource: row.openSource,
    releaseDate: row.releaseDate.toISOString().slice(0, 10),
    popularity: row.popularity,
    speedScore: row.speedScore,
    category: row.category,
    benchmarks: Object.fromEntries(row.benchmarks.map(({ benchmark, score }) => [benchmark.slug, score])) as Model["benchmarks"],
  }));
}

export async function getProviders(): Promise<Provider[]> {
  if (!isDatabaseEnabled()) return providers;
  const { prisma } = await import("@/lib/db");
  return prisma.provider.findMany({
    include: { _count: { select: { models: true } } },
    orderBy: { name: "asc" },
  }).then((rows) =>
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      color: row.color,
      initials: row.initials,
      headquarters: row.headquarters,
    })),
  );
}
