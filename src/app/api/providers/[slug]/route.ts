import { NextResponse } from "next/server";
import { getModels, getProviders } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const [allProviders, allModels] = await Promise.all([getProviders(), getModels()]);
    const provider = allProviders.find((item) => item.slug === slug);
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    return NextResponse.json({ ...provider, models: allModels.filter((model) => model.providerSlug === slug) });
  } catch (error) {
    console.error(`GET /api/providers/${slug} failed`, error);
    return NextResponse.json({ error: "Could not load provider" }, { status: 500 });
  }
}
