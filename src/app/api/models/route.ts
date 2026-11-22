import { NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/data";

const querySchema = z.object({
  search: z.string().trim().max(100).default(""),
  provider: z.string().trim().max(60).default(""),
  capability: z.string().trim().max(60).default(""),
  category: z.string().trim().max(40).default(""),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minContext: z.coerce.number().int().positive().optional(),
  sort: z.enum(["popularity", "inputPrice", "contextWindow", "speedScore"]).default("popularity"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(8),
});

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid model filters", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const filters = parsed.data;
    const query = filters.search.toLowerCase();
    const filtered = (await getModels())
      .filter((model) => !query || `${model.name} ${model.providerName}`.toLowerCase().includes(query))
      .filter((model) => !filters.provider || model.providerSlug === filters.provider)
      .filter((model) => !filters.capability || model.capabilities.some((item) => item.toLowerCase() === filters.capability.toLowerCase()))
      .filter((model) => !filters.category || model.category === filters.category)
      .filter((model) => filters.maxPrice === undefined || model.inputPrice <= filters.maxPrice)
      .filter((model) => filters.minContext === undefined || model.contextWindow >= filters.minContext)
      .sort((a, b) => filters.sort === "inputPrice" ? a.inputPrice - b.inputPrice : b[filters.sort] - a[filters.sort]);

    const start = (filters.page - 1) * filters.pageSize;
    return NextResponse.json({
      models: filtered.slice(start, start + filters.pageSize),
      total: filtered.length,
      page: filters.page,
      pageSize: filters.pageSize,
    });
  } catch (error) {
    console.error("GET /api/models failed", error);
    return NextResponse.json({ error: "Could not load models" }, { status: 500 });
  }
}
