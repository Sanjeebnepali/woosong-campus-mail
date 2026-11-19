/**
 * @file src/services/DatabaseClient.ts
 * @description Production Object-Oriented Database Repository for Neon PostgreSQL.
 * Uses the @neondatabase/serverless driver to execute parameterized SQL queries.
 * Includes a constructor and automatic resilience fallback to VerifiedSeedCatalog.
 */

import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { ICollege, IDepartment, IProfessor } from "@/types/directory.types";
import { VerifiedSeedCatalog } from "@/data/woosongVerifiedSeed";

/**
 * @class DatabaseRepository
 * @description Encapsulates all PostgreSQL database operations for Colleges,
 * Departments, Professors, Anonymous Template Logs, and PIPA Privacy Requests.
 */
export class DatabaseRepository {
  private readonly sql: NeonQueryFunction<false, false> | null;
  private readonly fallbackCatalog: VerifiedSeedCatalog;
  public readonly isConnectedToNeon: boolean;

  /**
   * Constructor initializes the Neon PostgreSQL connection using DATABASE_URL.
   * @param customConnectionString Optional override for the database URL.
   */
  constructor(customConnectionString?: string) {
    const dbUrl = customConnectionString || process.env.DATABASE_URL || "";
    this.fallbackCatalog = new VerifiedSeedCatalog();

    if (dbUrl.startsWith("postgres")) {
      this.sql = neon(dbUrl);
      this.isConnectedToNeon = true;
    } else {
      this.sql = null;
      this.isConnectedToNeon = false;
    }
  }

  /**
   * Fetches the complete directory catalog (colleges, departments, and joined professors)
   * directly from Neon PostgreSQL.
   */
  public async fetchFullDirectory(): Promise<{
    colleges: ICollege[];
    departments: IDepartment[];
    professors: IProfessor[];
    source: "neon-postgresql" | "local-verified-seed";
  }> {
    if (!this.sql) {
      return {
        colleges: this.fallbackCatalog.getColleges(),
        departments: this.fallbackCatalog.getDepartments(),
        professors: this.fallbackCatalog.getEnrichedProfessors(),
        source: "local-verified-seed",
      };
    }

    try {
      // Execute parallel queries for optimal latency
      const [collegesRows, departmentsRows, professorsRows] = await Promise.all([
        this.sql`SELECT id, name_ko, name_en, slug FROM colleges ORDER BY id ASC`,
        this.sql`SELECT id, college_id, name_ko, name_en, slug FROM departments ORDER BY id ASC`,
        this.sql`
          SELECT 
            p.id,
            p.department_id,
            p.name_ko,
            p.name_en,
            p.title_ko,
            p.title_en,
            p.email,
            p.office_location,
            p.research_fields,
            p.preferred_language,
            p.is_verified,
            p.source_url,
            d.name_ko AS department_name_ko,
            d.name_en AS department_name_en,
            c.name_ko AS college_name_ko,
            c.name_en AS college_name_en
          FROM professors p
          JOIN departments d ON p.department_id = d.id
          JOIN colleges c ON d.college_id = c.id
          ORDER BY p.department_id ASC, p.name_ko ASC
        `,
      ]);

      return {
        colleges: collegesRows as unknown as ICollege[],
        departments: departmentsRows as unknown as IDepartment[],
        professors: professorsRows as unknown as IProfessor[],
        source: "neon-postgresql",
      };
    } catch (error) {
      console.error("[DatabaseRepository] PostgreSQL query error, using verified seed:", error);
      return {
        colleges: this.fallbackCatalog.getColleges(),
        departments: this.fallbackCatalog.getDepartments(),
        professors: this.fallbackCatalog.getEnrichedProfessors(),
        source: "local-verified-seed",
      };
    }
  }

  /**
   * Inserts a newly verified professor record into Neon PostgreSQL.
   */
  public async createProfessor(input: {
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
  }): Promise<IProfessor | null> {
    if (!this.sql) return null;

    const rows = await this.sql`
      INSERT INTO professors (
        department_id, name_ko, name_en, title_ko, title_en,
        email, office_location, research_fields, preferred_language, is_verified, source_url
      ) VALUES (
        ${input.department_id}, ${input.name_ko}, ${input.name_en},
        ${input.title_ko}, ${input.title_en}, ${input.email},
        ${input.office_location}, ${input.research_fields},
        ${input.preferred_language}, TRUE, ${input.source_url}
      )
      RETURNING *
    `;

    return (rows[0] as unknown as IProfessor) ?? null;
  }

  /**
   * Logs an anonymous template generation event for analytics (zero personal student data stored).
   */
  public async logAnonymousGeneration(params: {
    professorId: number;
    purpose: string;
    language: string;
    tone: string;
  }): Promise<void> {
    if (!this.sql) return;
    try {
      await this.sql`
        INSERT INTO template_logs (professor_id, purpose, language, tone)
        VALUES (${params.professorId}, ${params.purpose}, ${params.language}, ${params.tone})
      `;
    } catch (err) {
      console.warn("[DatabaseRepository] Non-blocking analytics log warning:", err);
    }
  }

  /**
   * Records a PIPA compliance data update/removal request (정보 수정/삭제 요청).
   */
  public async createDataRequest(params: {
    professorId: number | null;
    requestType: "update" | "remove" | "add_new";
    requesterRole: "professor" | "student" | "staff";
    details: string;
  }): Promise<boolean> {
    if (!this.sql) return false;
    await this.sql`
      INSERT INTO data_requests (professor_id, request_type, requester_role, details)
      VALUES (${params.professorId}, ${params.requestType}, ${params.requesterRole}, ${params.details})
    `;
    return true;
  }
}
