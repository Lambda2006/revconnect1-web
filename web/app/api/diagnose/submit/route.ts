import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SYSTEM_LABELS } from "@/lib/diagnose/types";
import type { DiagnosticContext, DiagnosisResult, RankedCause, Stage2Question } from "@/lib/diagnose/types";
import { STAGE2_QUESTIONS } from "@/lib/diagnose/stage2Questions";

let _anthropic: Anthropic | undefined;
const getAnthropic = () => (_anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }));

function formatAnswers(
  questions: Array<{ id: string; label: string; type: string; options?: Array<{ value: string; label: string }> }>,
  answers: Record<string, string>
): string {
  return questions
    .filter((q) => answers[q.id])
    .map((q) => {
      const raw = answers[q.id];
      const label =
        q.type === "select"
          ? q.options?.find((o: { value: string; label: string }) => o.value === raw)?.label ?? raw
          : raw;
      return `  • ${q.label}: ${label}`;
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
    const context = await request.json() as DiagnosticContext;
    const { boat, system, stage2Answers, stage3Answers, stage3Questions } = context;

    // Verify boat belongs to user
    const { data: boatRow } = await supabaseAdmin
      .from("boats")
      .select("id, owner_id")
      .eq("id", boat.id)
      .single();
    if (!boatRow || boatRow.owner_id !== user.id) {
      return NextResponse.json({ error: "Boat not found" }, { status: 404 });
    }

    const systemLabel = SYSTEM_LABELS[system] ?? system;
    const stage2Qs = STAGE2_QUESTIONS[system] as Stage2Question[];

    const stage2Summary = formatAnswers(stage2Qs, stage2Answers);
    const stage3Summary = stage3Questions.length > 0
      ? formatAnswers(stage3Questions, stage3Answers)
      : "  (none)";

    const systemPrompt = `You are a master marine mechanic performing a structured diagnostic assessment.
You will receive a complete set of structured diagnostic information about a boat fault and must produce a ranked diagnosis.

CRITICAL RULES:
- Base your diagnosis strictly on the provided diagnostic data
- Rank causes from most to least likely given the specific combination of symptoms
- Each cause must have clear diagnostic reasoning tied to the specific answers provided
- Steps should be concrete, actionable, and ordered from easiest/safest to most involved
- If there is any safety risk, set safetyFlag to true
- If the fault requires professional equipment or significant disassembly, set recommendProfessional to true

Respond with ONLY valid JSON. No markdown, no preamble. Format exactly:
{
  "summary": "One to two sentence summary of the most likely diagnosis",
  "rankedCauses": [
    {
      "rank": 1,
      "cause": "Specific cause name",
      "likelihood": "high",
      "reasoning": "Why this specific combination of answers points to this cause",
      "steps": [
        "Specific step 1",
        "Specific step 2"
      ]
    }
  ],
  "safetyFlag": false,
  "recommendProfessional": false
}`;

    const userMessage = `BOAT: ${boat.year ?? "Unknown year"} ${boat.make} ${boat.model}
Engine: ${boat.engine_type ?? "Unknown"}
Engine Hours: ${boat.engine_hours ?? "Unknown"}

FAULT SYSTEM: ${systemLabel}

STAGE 2 — SYMPTOM ASSESSMENT:
${stage2Summary}

STAGE 3 — TARGETED ELIMINATION:
${stage3Summary}

Provide a ranked diagnosis with 2–4 most likely causes. Be specific to this boat's make, model, and engine type where relevant.`;

    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock?.type === "text" ? textBlock.text.trim() : "";

    // Extract JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[diagnose/submit] No JSON object found in response:", rawText);
      return NextResponse.json({ error: "Failed to generate diagnosis" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]) as DiagnosisResult;

    // Validate and sanitize
    const result: DiagnosisResult = {
      summary: typeof parsed.summary === "string" ? parsed.summary : "Diagnosis complete — see ranked causes below.",
      rankedCauses: Array.isArray(parsed.rankedCauses)
        ? parsed.rankedCauses.map((c: RankedCause, i: number) => ({
            rank: c.rank ?? i + 1,
            cause: c.cause ?? "Unknown cause",
            likelihood: (["high", "medium", "low"].includes(c.likelihood) ? c.likelihood : "medium") as RankedCause["likelihood"],
            reasoning: c.reasoning ?? "",
            steps: Array.isArray(c.steps) ? c.steps : [],
          }))
        : [],
      safetyFlag: parsed.safetyFlag === true,
      recommendProfessional: parsed.recommendProfessional === true,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("[diagnose/submit] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
