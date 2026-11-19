/**
 * @file src/app/api/requests/route.ts
 * @description PIPA Privacy Compliance & Faculty Self-Service Endpoint (정보 수정/삭제 요청).
 * Allows professors or students to request immediate updates, corrections, or removal
 * of faculty directory entries, persisted into Neon PostgreSQL `data_requests`.
 */

import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "@/services/DatabaseClient";
import { rateLimit, cleanString, positiveInt } from "@/lib/security";

/**
 * @class PrivacyRequestTicket
 * @description OOP Value Class with constructor that sanitizes and validates
 * faculty update/removal requests in compliance with Korean privacy regulations (PIPA).
 */
class PrivacyRequestTicket {
  public readonly professorId: number | null;
  public readonly requestType: "update" | "remove" | "add_new";
  public readonly requesterRole: "professor" | "student" | "staff";
  public readonly details: string;

  /**
   * Constructor normalizes and sanitizes incoming request fields.
   */
  constructor(raw: Record<string, unknown>) {
    this.professorId = positiveInt(raw.professorId);
    const rawType = String(raw.requestType ?? "update");
    this.requestType =
      rawType === "remove" || rawType === "add_new" ? rawType : "update";

    const rawRole = String(raw.requesterRole ?? "student");
    this.requesterRole =
      rawRole === "professor" || rawRole === "staff" ? rawRole : "student";

    this.details = cleanString(raw.details, 1000);
  }

  /**
   * Validates that sufficient details are provided for the administrator.
   */
  public isValid(): boolean {
    return this.details.length >= 5;
  }
}

/**
 * POST /api/requests
 * Submits a PIPA update or removal ticket into the Neon PostgreSQL database.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const limited = rateLimit(request, "requests", 5);
  if (limited) return limited;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const ticket = new PrivacyRequestTicket(body);

    if (!ticket.isValid()) {
      return NextResponse.json(
        { error: "Please provide at least 5 characters describing the update or removal request." },
        { status: 400 }
      );
    }

    const repo = new DatabaseRepository();
    const saved = await repo.createDataRequest({
      professorId: ticket.professorId,
      requestType: ticket.requestType,
      requesterRole: ticket.requesterRole,
      details: ticket.details,
    });

    return NextResponse.json(
      {
        success: true,
        persistedToDb: saved,
        message: "요청이 정상적으로 접수되었습니다. (Your request has been logged for immediate review.)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/requests] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit privacy request." },
      { status: 500 }
    );
  }
}
