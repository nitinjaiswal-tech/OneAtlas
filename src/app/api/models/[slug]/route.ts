import { NextResponse } from "next/server";
import { getModels } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const model = (await getModels()).find((item) => item.slug === slug);
    if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });
    return NextResponse.json(model);
  } catch (error) {
    console.error(`GET /api/models/${slug} failed`, error);
    return NextResponse.json({ error: "Could not load model" }, { status: 500 });
  }
}
