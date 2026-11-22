import { NextResponse } from "next/server";
import { getModels } from "@/lib/data";

export async function GET(request: Request) {
  const slugs = new URL(request.url).searchParams.get("slugs")?.split(",").filter(Boolean) ?? [];
  if (slugs.length > 4) return NextResponse.json({ error: "Compare up to four models at a time" }, { status: 400 });
  try {
    const allModels = await getModels();
    const selected = slugs.map((slug) => allModels.find((model) => model.slug === slug)).filter((model) => model !== undefined);
    return NextResponse.json({ models: selected });
  } catch (error) {
    console.error("GET /api/compare failed", error);
    return NextResponse.json({ error: "Could not compare models" }, { status: 500 });
  }
}
