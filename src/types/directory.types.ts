/**
 * @file src/types/directory.types.ts
 * @description Core TypeScript interfaces and Object-Oriented Domain Models (with constructors)
 * for the Woosong University Faculty Directory and Academic Email Information System.
 * Supports 4 campus languages: Korean ('ko'), English ('en'), Chinese ('zh'), and Vietnamese ('vi').
 */

// ============================================================================
// 1. CORE ENUMERATIONS & UNION TYPES
// ============================================================================

/**
 * Supported portal and email languages:
 * - 'ko': 한국어 (Korean)
 * - 'en': English
 * - 'zh': 中文 (Simplified Chinese)
 * - 'vi': Tiếng Việt (Vietnamese)
 */
export type SupportedLanguage = "ko" | "en" | "zh" | "vi";
export type EmailDraftLanguage = SupportedLanguage;

/**
 * Supported email etiquette tone levels.
 */
export type EmailTone = "formal" | "polite";

/**
 * The 5 core academic email scenarios.
 */
export type EmailPurpose =
  | "appointment"
  | "absence"
  | "assignment"
  | "grade"
  | "research_lab";

/**
 * Directory layout display modes.
 */
export type DirectoryViewMode = "grid" | "table";

// ============================================================================
// 2. DATA TRANSFER INTERFACES (Database & API Contracts)
// ============================================================================

export interface ICollege {
  id: number;
  name_ko: string;
  name_en: string;
  slug: string;
}

export interface IDepartment {
  id: number;
  college_id: number;
  name_ko: string;
  name_en: string;
  slug: string;
}

export interface IProfessor {
  id: number;
  department_id: number;
  name_ko: string;
  name_en: string;
  title_ko: string;
  title_en: string;
  email: string;
  office_location: string;
  research_fields: string;
  preferred_language: "ko" | "en" | "both";
  is_verified: boolean;
  source_url: string;
  department_name_ko?: string;
  department_name_en?: string;
  college_name_ko?: string;
  college_name_en?: string;
}

export interface IEmailFormInput {
  studentName: string;
  studentId: string;
  studentMajor: string;
  courseName: string;
  purpose: EmailPurpose;
  language: EmailDraftLanguage;
  tone: EmailTone;
  keyDetails: string;
  preferredTimeSlot: string;
  studentContact: string;
}

// ============================================================================
// 3. OBJECT-ORIENTED DOMAIN CLASSES WITH CONSTRUCTORS
// ============================================================================

/**
 * @class ProfessorDomainModel
 * @description Encapsulates a Professor record with helper methods for domain verification.
 */
export class ProfessorDomainModel {
  public readonly data: IProfessor;

  /** Constructor initializes the domain model with a raw professor database record. */
  constructor(rawProfessor: IProfessor) {
    this.data = rawProfessor;
  }

  /** Extracts the official email domain (e.g., 'wsu.ac.kr' or 'endicott.ac.kr'). */
  public getEmailDomain(): string {
    const parts = this.data.email.split("@");
    return parts.length === 2 ? parts[1].toLowerCase() : "wsu.ac.kr";
  }
}

/**
 * @class GeneratedEmailDraft
 * @description Value object with constructor representing the output of the EmailTemplateEngine.
 */
export class GeneratedEmailDraft {
  public readonly subject: string;
  public readonly body: string;
  public readonly etiquetteChecklist: string[];
  public readonly wordCount: number;
  public readonly generatedBy: "template-engine" | "ai-llm-hybrid";

  /** Constructor calculates word count automatically and freezes etiquette metadata. */
  constructor(params: {
    subject: string;
    body: string;
    etiquetteChecklist: string[];
    generatedBy?: "template-engine" | "ai-llm-hybrid";
  }) {
    this.subject = params.subject.trim();
    this.body = params.body.trim();
    this.etiquetteChecklist = params.etiquetteChecklist;
    this.generatedBy = params.generatedBy ?? "template-engine";
    this.wordCount = this.body
      .split(/\s+/)
      .filter((token) => token.length > 0).length;
  }
}
