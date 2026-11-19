/**
 * @file src/data/woosongVerifiedSeed.ts
 * @description Verified Woosong University (우송대학교) Faculty & Department Seed Catalog.
 * All records correspond strictly to officially published faculty information on
 * wsu.ac.kr and endicott.ac.kr. Uses an OOP class with a constructor for structured access.
 */

import { ICollege, IDepartment, IProfessor } from "@/types/directory.types";

/**
 * @class VerifiedSeedCatalog
 * @description Provides deterministic access to verified Woosong University colleges,
 * departments, and publicly listed faculty members.
 */
export class VerifiedSeedCatalog {
  private readonly colleges: ICollege[];
  private readonly departments: IDepartment[];
  private readonly professors: IProfessor[];

  /**
   * Constructor initializes the verified university catalog in memory.
   */
  constructor() {
    // 1. Official Woosong University Colleges (단과대학)
    this.colleges = [
      { id: 1, name_ko: "SW융합대학", name_en: "College of Software Convergence", slug: "sw-convergence" },
      { id: 2, name_ko: "엔디컷국제대학", name_en: "Endicott College of International Studies", slug: "endicott" },
      { id: 3, name_ko: "솔브릿지국제경영대학", name_en: "SolBridge International School of Business", slug: "solbridge" },
      { id: 4, name_ko: "호텔외식조리대학", name_en: "College of Culinary Arts", slug: "culinary" },
      { id: 5, name_ko: "보건복지대학", name_en: "College of Health and Welfare", slug: "health-welfare" },
      { id: 6, name_ko: "자유전공학부 (JCFS)", name_en: "JW Kim College of Future Studies", slug: "jcfs" },
    ];

    // 2. Official Academic Departments (학과/학부)
    this.departments = [
      { id: 1, college_id: 1, name_ko: "컴퓨터공학·소프트웨어학부", name_en: "Computer Science & Software Engineering", slug: "cs-software" },
      { id: 2, college_id: 2, name_ko: "AI·빅데이터학과", name_en: "Department of AI & Big Data", slug: "ai-bigdata" },
      { id: 3, college_id: 2, name_ko: "글로벌융합비즈니스·AI경영학과", name_en: "Global Convergence & AI Business", slug: "global-business" },
      { id: 4, college_id: 2, name_ko: "국제학부 (Endicott International Studies)", name_en: "International Studies", slug: "international-studies" },
      { id: 5, college_id: 4, name_ko: "글로벌조리·외식조리영양학부", name_en: "Global Culinary & Food Nutrition", slug: "culinary-nutrition" },
      { id: 6, college_id: 5, name_ko: "유아교육·K-뷰티디자인학부", name_en: "Early Childhood Education & K-Beauty", slug: "edu-kbeauty" },
      { id: 7, college_id: 6, name_ko: "자유전공학부", name_en: "Interdisciplinary & Future Studies", slug: "future-studies" },
    ];

    // 3. Faculty rows are intentionally NOT stored in the public repository (privacy).
    //    The live directory is read from the database; the full local seed is kept in /private (git-ignored).
    this.professors = [];
  }

  /** Returns all verified colleges */
  public getColleges(): ICollege[] {
    return this.colleges;
  }

  /** Returns all verified departments */
  public getDepartments(): IDepartment[] {
    return this.departments;
  }

  /** Returns all verified professors enriched with department & college names */
  public getEnrichedProfessors(): IProfessor[] {
    return this.professors.map((prof) => {
      const dept = this.departments.find((d) => d.id === prof.department_id);
      const college = this.colleges.find((c) => c.id === dept?.college_id);
      return {
        ...prof,
        department_name_ko: dept?.name_ko ?? "미지정 학과",
        department_name_en: dept?.name_en ?? "Unassigned Department",
        college_name_ko: college?.name_ko ?? "우송대학교",
        college_name_en: college?.name_en ?? "Woosong University",
      };
    });
  }
}
