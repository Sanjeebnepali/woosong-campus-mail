/**
 * @file src/app/api/generate-email/route.ts
 * @description Hybrid Email Generation API Endpoint.
 * Combines our deterministic OOP EmailTemplateEngine with an optional LLM refinement layer
 * (Gemini / OpenAI via .env) and logs anonymous usage metrics into Neon PostgreSQL.
 */

import { NextRequest, NextResponse } from "next/server";
import { EmailTemplateEngine } from "@/services/EmailTemplateEngine";
import { DatabaseRepository } from "@/services/DatabaseClient";
import { rateLimit, cleanString, positiveInt } from "@/lib/security";
import {
  GeneratedEmailDraft,
  IEmailFormInput,
  IProfessor,
} from "@/types/directory.types";

/**
 * @class AIHybridRefiner
 * @description OOP Service class with constructor that checks if an external LLM API key
 * (GEMINI_API_KEY) is present in the environment and optionally refines the structured draft.
 */
class AIHybridRefiner {
  private readonly baseDraft: GeneratedEmailDraft;
  private readonly input: IEmailFormInput;
  private readonly professor: IProfessor;
  private readonly geminiApiKey: string;

  /**
   * Constructor binds the deterministic draft and checks for optional LLM credentials.
   */
  constructor(
    baseDraft: GeneratedEmailDraft,
    professor: IProfessor,
    input: IEmailFormInput
  ) {
    this.baseDraft = baseDraft;
    this.professor = professor;
    this.input = input;
    this.geminiApiKey = process.env.GEMINI_API_KEY || "";
  }

  /**
   * Returns either the LLM-refined draft (if GEMINI_API_KEY is configured)
   * or the 100% deterministic, zero-latency OOP Template Engine draft.
   */
  public async refineOrFallback(): Promise<GeneratedEmailDraft> {
    if (!this.geminiApiKey) {
      return this.baseDraft;
    }

    try {
      const systemInstruction =
        this.input.language === "ko"
          ? "당신은 대한민국 대학 이메일 예절 전문가입니다. 제공된 초안의 사실관계(학번, 이름, 과목명, 용건)를 절대 변경하거나 지어내지 말고, 교수님께 보내는 가장 정중하고 자연스러운 격식체(존댓말) 본문으로만 다듬어 출력하세요."
          : "You are an academic email etiquette advisor. Polish the provided email body for clarity and academic courtesy without inventing any facts. Output only the polished body text.";

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          // API key travels in a header, never in the URL (URLs end up in logs).
          headers: { "Content-Type": "application/json", "x-goog-api-key": this.geminiApiKey },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\n[Draft Body]:\n${this.baseDraft.body}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        return this.baseDraft;
      }

      const json = await response.json();
      const refinedText =
        json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!refinedText) {
        return this.baseDraft;
      }

      return new GeneratedEmailDraft({
        subject: this.baseDraft.subject,
        body: refinedText,
        etiquetteChecklist: [
          ...this.baseDraft.etiquetteChecklist,
          "AI LLM 문맥 윤문 및 아카데믹 어조 최적화 완료",
        ],
        generatedBy: "ai-llm-hybrid",
      });
    } catch (error) {
      console.warn("[AIHybridRefiner] Falling back to deterministic template:", error);
      return this.baseDraft;
    }
  }
}

/**
 * POST /api/generate-email
 * Generates an etiquette-compliant email draft and records anonymous usage analytics.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const limited = rateLimit(request, "generate-email", 20);
  if (limited) return limited;

  try {
    const payload = (await request.json()) as {
      professor?: { id?: unknown };
      formInput?: Record<string, unknown>;
    };

    const professorId = positiveInt(payload?.professor?.id);
    const raw = payload?.formInput;
    if (!professorId || !raw || typeof raw !== "object") {
      return NextResponse.json(
        { error: "Professor and form input payload are required." },
        { status: 400 }
      );
    }

    // Never trust a client-supplied professor record: load the verified one from the database.
    const catalog = await new DatabaseRepository().fetchFullDirectory();
    const professor = catalog.professors.find((p) => p.id === professorId);
    if (!professor) {
      return NextResponse.json({ error: "Professor not found." }, { status: 404 });
    }

    const purposes = ["appointment", "absence", "assignment", "grade", "research_lab"] as const;
    const languages = ["ko", "en", "zh", "vi"] as const;
    const purpose = purposes.find((v) => v === raw.purpose);
    const language = languages.find((v) => v === raw.language);
    if (!purpose || !language) {
      return NextResponse.json({ error: "Invalid purpose or language." }, { status: 400 });
    }

    const formInput: IEmailFormInput = {
      studentName: cleanString(raw.studentName, 60),
      studentId: cleanString(raw.studentId, 20),
      studentMajor: cleanString(raw.studentMajor, 80),
      courseName: cleanString(raw.courseName, 80),
      purpose,
      language,
      tone: raw.tone === "polite" ? "polite" : "formal",
      keyDetails: cleanString(raw.keyDetails, 800),
      preferredTimeSlot: cleanString(raw.preferredTimeSlot, 100),
      studentContact: cleanString(raw.studentContact, 100),
    };

    // 1. Instantiate the OOP EmailTemplateEngine via its constructor
    const engine = new EmailTemplateEngine(professor, formInput);
    const deterministicDraft = engine.buildDraft();

    // 2. Optionally run AIHybridRefiner if GEMINI_API_KEY is configured
    const refiner = new AIHybridRefiner(deterministicDraft, professor, formInput);
    const finalDraft = await refiner.refineOrFallback();

    // 3. Log anonymous generation metrics to Neon PostgreSQL (non-blocking)
    const dbRepo = new DatabaseRepository();
    await dbRepo.logAnonymousGeneration({
      professorId: professor.id,
      purpose: formInput.purpose,
      language: formInput.language,
      tone: formInput.tone,
    });

    return NextResponse.json({ draft: finalDraft }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/generate-email] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate academic email draft." },
      { status: 500 }
    );
  }
}
