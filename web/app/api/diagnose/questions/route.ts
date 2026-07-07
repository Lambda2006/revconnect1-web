import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SYSTEM_LABELS } from "@/lib/diagnose/types";
import type { DiagnosticSystem, Stage2Question, Stage3Question } from "@/lib/diagnose/types";

let _anthropic: Anthropic | undefined;
const getAnthropic = () => (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }));

function formatStage2Summary(
  questions: Stage2Question[],
  answers: Record<string, string>
): string {
  return questions
    .filter((q) => answers[q.id])
    .map((q) => {
      const raw = answers[q.id];
      const label =
        q.type === "select"
          ? q.options?.find((o) => o.value === raw)?.label ?? raw
          : raw;
      return `- ${q.label}: ${label}`;
    })
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    // Auth
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    let user = (await supabase.auth.getUser()).data?.user ?? null;

    if (!user) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data } = await supabaseAdmin.auth.getUser(token);
        user = data?.user ?? null;
      }
    }
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Guided Diagnosis is available to all authenticated users (no subscription required).

    // Parse body
    const body = await request.json();
    const {
      boatId,
      system,
      stage2Questions,
      stage2Answers,
    } = body as {
      boatId: string;
      system: DiagnosticSystem;
      stage2Questions: Stage2Question[];
      stage2Answers: Record<string, string>;
    };

    // Fetch boat
    const { data: boat } = await supabaseAdmin
      .from("boats")
      .select("year, make, model, engine_type, engine_hours")
      .eq("id", boatId)
      .single();

    if (!boat) return NextResponse.json({ error: "Boat not found" }, { status: 404 });

    const systemLabel = SYSTEM_LABELS[system] ?? system;
    const stage2Summary = formatStage2Summary(stage2Questions, stage2Answers);

    const prompt = `You are a marine diagnostic specialist. A boater is troubleshooting their boat and needs targeted follow-up questions to narrow down the fault.

BOAT: ${boat.year ?? "Unknown year"} ${boat.make} ${boat.model}
Engine: ${boat.engine_type ?? "Unknown"}
Engine Hours: ${boat.engine_hours ?? "Unknown"}

FAULT SYSTEM: ${systemLabel}

INFORMATION COLLECTED SO FAR:
${stage2Summary}

Based on this diagnostic context, generate exactly 2 to 4 targeted follow-up questions that target the most diagnostically significant unknowns. These should be elimination questions — each one should help confirm or rule out a specific probable cause.

Rules:
- Do NOT repeat anything already answered above
- Make each question specific to this boat and fault system
- Prefer "select" type with 3–4 clear options when possible; use "text" when free-form detail is needed
- Keep question labels concise (under 12 words)

Respond with ONLY a valid JSON array. No markdown, no explanation. Format:
[
  {
    "id": "q1",
    "label": "Short question text?",
    "type": "select",
    "options": [
      { "value": "option_a", "label": "Human readable A" },
      { "value": "option_b", "label": "Human readable B" }
    ]
  },
  {
    "id": "q2",
    "label": "Another question?",
    "type": "text",
    "placeholder": "e.g. describe what you observe"
  }
]`;

    const response = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text.trim() : "";

    // Extract JSON from response (strip any accidental markdown fences)
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[diagnose/questions] No JSON array found in response:", rawText);
      return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
    }

    const questions: Stage3Question[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[diagnose/questions] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
