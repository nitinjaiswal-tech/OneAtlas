import { NextResponse } from "next/server";
import { z } from "zod";
import { getModels } from "@/lib/data";

const schema = z.object({
  category: z.enum(["overall", "coding", "reasoning", "speed", "value"]).default("overall"),
});

export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid ranking category" }, { status: 400 });
  try {
    const category = parsed.data.category;
    const models = await getModels();
    const ranked = models
      .map((model) => {
        const score = category === "speed"
          ? model.speedScore
          : category === "value"
            ? Math.round((100 - model.inputPrice * 8) * 0.6 + model.popularity * 0.4)
            : category === "coding"
              ? Math.round(model.benchmarks.humanEval * 0.45 + model.benchmarks.sweBench * 0.55)
              : category === "reasoning"
                ? Math.round(model.benchmarks.gpqa * 0.55 + model.benchmarks.mmlu * 0.45)
                : Math.round(model.popularity * 0.55 + model.benchmarks.mmlu * 0.45);
        return { ...model, score: Math.max(0, score) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    return NextResponse.json({ category, models: ranked });
  } catch (error) {
    console.error("GET /api/rankings failed", error);
    return NextResponse.json({ error: "Could not load rankings" }, { status: 500 });
  }
}
