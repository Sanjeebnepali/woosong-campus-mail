/**
 * @file src/app/api/directory/route.ts
 * @description Next.js Production API Route for fetching and adding verified university
 * directory records (Colleges, Departments, and Professors) via Neon PostgreSQL.
 */

import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "@/services/DatabaseClient";
import { requireAdmin, rateLimit, cleanString, positiveInt } from "@/lib/security";

/** Only official university mail domains may be registered. */
const ALLOWED_EMAIL_DOMAINS = ["wsu.ac.kr", "endicott.ac.kr"];

/**
 * @class ProfessorPayloadValidator
 * @description OOP Validator class with constructor to strictly validate incoming
 * professor creation requests so invalid or unverified emails are rejected.
 */
class ProfessorPayloadValidator {
  private readonly body: Record<string, unknown>;

  /**
   * Constructor stores the raw request body for validation.
   */
  constructor(body: Record<string, unknown>) {
    this.body = body;
  }

  /**
   * Validates required fields and university email format.
   */
  public validate(): {
    isValid: boolean;
    errorMessage?: string;
    sanitized?: {
      department_id: number;
      name_ko: string;
      name_en: string;
      title_ko: string;
      title_en: string;
      email: string;
      office_location: string;
      research_fields: string;
      preferred_language: "ko" | "en" | "both";
      source_url: string;
    };
  } {
    const department_id = positiveInt(this.body.department_id);
    const name_ko = cleanString(this.body.name_ko, 60);
    const name_en = cleanString(this.body.name_en, 80);
    const email = cleanString(this.body.email, 254).toLowerCase();
    const research_fields = cleanString(this.body.research_fields, 300);

    if (!department_id || !name_ko || !name_en || !email || !research_fields) {
      return {
        isValid: false,
        errorMessage: "Required fields (Department, Korean Name, English Name, Official Email, Research Fields) must be provided.",
      };
    }

    // Ensure valid email structure AND an official university domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const domain = email.split("@")[1] ?? "";
    if (!emailRegex.test(email) || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
      return {
        isValid: false,
        errorMessage: "Please enter a valid official university email address (@wsu.ac.kr or @endicott.ac.kr).",
      };
    }

    const lang = this.body.preferred_language;
    const preferred_language: "ko" | "en" | "both" = lang === "ko" || lang === "en" ? lang : "both";
    const sourceRaw = cleanString(this.body.source_url, 300);
    const source_url = /^https:\/\/([a-z0-9-]+\.)*wsu\.ac\.kr(\/|$)/i.test(sourceRaw) ? sourceRaw : "https://www.wsu.ac.kr";

    return {
      isValid: true,
      sanitized: {
        department_id,
        name_ko,
        name_en,
        title_ko: cleanString(this.body.title_ko ?? "교수", 40) || "교수",
        title_en: cleanString(this.body.title_en ?? "Professor", 60) || "Professor",
        email,
        office_location: cleanString(this.body.office_location, 100) || "학과 사무실 문의",
        research_fields,
        preferred_language,
        source_url,
      },
    };
  }
}

/**
 * GET /api/directory
 * Returns the full hierarchy of Colleges, Departments, and Verified Professors.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const repo = new DatabaseRepository();
    const catalog = await repo.fetchFullDirectory();
    return NextResponse.json(catalog, { status: 200 });
  } catch (error) {
    console.error("[GET /api/directory] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to load faculty directory." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/directory
 * Validates and inserts a newly verified professor into the Neon PostgreSQL database.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const limited = rateLimit(request, "directory-write", 10);
  if (limited) return limited;

  try {
    const rawBody = (await request.json()) as Record<string, unknown>;
    const validator = new ProfessorPayloadValidator(rawBody);
    const validation = validator.validate();

    if (!validation.isValid || !validation.sanitized) {
      return NextResponse.json(
        { error: validation.errorMessage },
        { status: 400 }
      );
    }

    const repo = new DatabaseRepository();
    const createdProf = await repo.createProfessor(validation.sanitized);

    if (!createdProf) {
      return NextResponse.json(
        { error: "Database write failed or duplicate email exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Verified professor added successfully.", professor: createdProf },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/directory] Error creating professor:", error);
    return NextResponse.json(
      { error: "Could not save professor record. Ensure email is unique." },
      { status: 500 }
    );
  }
}
