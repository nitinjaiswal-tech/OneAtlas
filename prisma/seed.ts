import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { models, providers, benchmarkLabels } from "../src/lib/demo-data";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before running the demo seed.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const providerIds = new Map<string, string>();
  for (const provider of providers) {
    const saved = await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: provider,
      create: provider,
    });
    providerIds.set(provider.slug, saved.id);
  }

  const benchmarks = new Map<string, string>();
  for (const [slug, name] of Object.entries(benchmarkLabels)) {
    const saved = await prisma.benchmark.upsert({
      where: { slug },
      update: { name, unit: "%" },
      create: { slug, name, unit: "%" },
    });
    benchmarks.set(slug, saved.id);
  }

  for (const model of models) {
    const providerId = providerIds.get(model.providerSlug);
    if (!providerId) throw new Error(`Missing provider seed for ${model.providerSlug}.`);
    const saved = await prisma.model.upsert({
      where: { slug: model.slug },
      update: {
        name: model.name,
        providerId,
        description: model.description,
        version: model.version,
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        modalities: model.modalities,
        openSource: model.openSource,
        releaseDate: new Date(model.releaseDate),
        popularity: model.popularity,
        speedScore: model.speedScore,
        category: model.category,
      },
      create: {
        name: model.name,
        slug: model.slug,
        providerId,
        description: model.description,
        version: model.version,
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        modalities: model.modalities,
        openSource: model.openSource,
        releaseDate: new Date(model.releaseDate),
        popularity: model.popularity,
        speedScore: model.speedScore,
        category: model.category,
      },
    });

    await prisma.modelCapability.deleteMany({ where: { modelId: saved.id } });
    for (const name of model.capabilities) {
      const capability = await prisma.capability.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await prisma.modelCapability.create({ data: { modelId: saved.id, capabilityId: capability.id } });
    }

    await prisma.modelBenchmark.deleteMany({ where: { modelId: saved.id } });
    for (const [slug, score] of Object.entries(model.benchmarks)) {
      const benchmarkId = benchmarks.get(slug);
      if (benchmarkId) {
        await prisma.modelBenchmark.create({ data: { modelId: saved.id, benchmarkId, score } });
      }
    }
  }

  console.log(`Seeded ${providers.length} providers and ${models.length} models.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
