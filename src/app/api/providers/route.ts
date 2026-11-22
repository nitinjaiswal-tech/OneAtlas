import { NextResponse } from "next/server";
import { getModels, getProviders } from "@/lib/data";

export async function GET() {
  try {
    const [allProviders, allModels] = await Promise.all([getProviders(), getModels()]);
    return NextResponse.json(allProviders.map((provider) => ({
      ...provider,
      modelCount: allModels.filter((model) => model.providerSlug === provider.slug).length,
    })));
  } catch (error) {
    console.error("GET /api/providers failed", error);
    return NextResponse.json({ error: "Could not load providers" }, { status: 500 });
  }
}
