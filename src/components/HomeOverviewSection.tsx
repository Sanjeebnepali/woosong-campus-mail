/**
 * @file src/components/HomeOverviewSection.tsx
 * @description Institutional Portal Home Dashboard modeled after Woosong University
 * Student Information System (wsinfo.wsu.ac.kr).
 * Mobile-first responsive layout: renders touch-friendly College Cards on phones (< 768px)
 * and the full institutional table on desktop (>= 768px).
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useMemo } from "react";
import { Search, Mail, Database, ArrowRight, FileText } from "lucide-react";
import { ICollege, IDepartment, IProfessor, SupportedLanguage } from "@/types/directory.types";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

export type ActiveAppSection = "home" | "directory" | "composer" | "packet_lab";

/**
 * @class HomePortalMetricsEngine
 * @description OOP Metrics Constructor Class that calculates live faculty counts
 * per college and formats single-language college/department names via CatalogLocalizer.
 */
export class HomePortalMetricsEngine {
  private readonly colleges: ICollege[];
  private readonly departments: IDepartment[];
  private readonly professors: IProfessor[];
  private readonly localizer: CatalogLocalizer;

  /** Constructor binds the live database catalog and single-language CatalogLocalizer. */
  constructor(params: {
    colleges: ICollege[];
    departments: IDepartment[];
    professors: IProfessor[];
    lang: SupportedLanguage;
  }) {
    this.colleges = params.colleges;
    this.departments = params.departments;
    this.professors = params.professors;
    this.localizer = new CatalogLocalizer(params.lang);
  }

  /** Computes single-language college rows without dual-language mixing. */
  public getCollegeRows(): Array<{
    college: ICollege;
    collegeDisplayName: string;
    professorCount: number;
    departmentNames: string;
  }> {
    return this.colleges.map((college) => {
      const collegeDepts = this.departments.filter((d) => d.college_id === college.id);
      const deptIds = new Set(collegeDepts.map((d) => d.id));
      const profCount = this.professors.filter((p) => deptIds.has(p.department_id)).length;
      const departmentNames =
        collegeDepts.map((d) => this.localizer.getDepartmentName(d)).join(", ") || "-";

      return {
        college,
        collegeDisplayName: this.localizer.getCollegeName(college),
        professorCount: profCount,
        departmentNames,
      };
    });
  }
}

interface IHomeOverviewSectionProps {
  uiLanguage: SupportedLanguage;
  colleges: ICollege[];
  departments: IDepartment[];
  professors: IProfessor[];
  isLoading?: boolean;
  onNavigateSection: (section: ActiveAppSection) => void;
  onSelectCollegeAndGo: (collegeId: number) => void;
}

/**
 * @component HomeOverviewSection
 * @description Renders the official wsinfo-style portal overview with full mobile responsiveness.
 */
export const HomeOverviewSection: React.FC<IHomeOverviewSectionProps> = ({
  uiLanguage,
  colleges,
  departments,
  professors,
  isLoading = false,
  onNavigateSection,
  onSelectCollegeAndGo,
}) => {
  const t = useMemo(
    () => new PortalTranslationDictionary(uiLanguage).getStrings(),
    [uiLanguage]
  );

  const engine = useMemo(
    () =>
      new HomePortalMetricsEngine({
        colleges,
        departments,
        professors,
        lang: uiLanguage,
      }),
    [colleges, departments, professors, uiLanguage]
  );

  const collegeRows = engine.getCollegeRows();

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 1. Official System Notice & Quick Action Header Panel */}
      <section className="rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white p-4 shadow-2xs sm:p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-[3px] bg-[#357A16] px-2.5 py-1 text-xs font-bold text-white">
                {t.officialNoticeBadge}
              </span>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {t.homeBannerTitle}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 sm:text-base">
              {t.homeBannerDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:flex sm:shrink-0 sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => onNavigateSection("directory")}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#357A16] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2A6712] sm:py-2.5"
            >
              <Search className="h-4 w-4" />
              <span>{t.goToDirectoryBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection("composer")}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-[#357A16] bg-white px-4 py-3 text-sm font-bold text-[#357A16] transition hover:bg-slate-50 sm:py-2.5"
            >
              <Mail className="h-4 w-4" />
              <span>{t.goToComposerBtn}</span>
            </button>
          </div>
        </div>

        {/* Institutional Database Summary Metrics Strip */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="text-xs font-semibold text-slate-600 sm:text-sm">{t.kpiColleges}</div>
            <div className="mt-1 text-xl font-bold text-[#357A16] sm:text-2xl">{colleges.length}</div>
          </div>
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="text-xs font-semibold text-slate-600 sm:text-sm">{t.kpiDepartments}</div>
            <div className="mt-1 text-xl font-bold text-[#357A16] sm:text-2xl">{departments.length}</div>
          </div>
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="text-xs font-semibold text-slate-600 sm:text-sm">{t.kpiFaculty}</div>
            <div className="mt-1 text-xl font-bold text-[#357A16] sm:text-2xl">{isLoading ? "–" : professors.length}</div>
          </div>
          <div className="rounded-[4px] border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="text-xs font-semibold text-slate-600 sm:text-sm">{t.kpiTemplates}</div>
            <div className="mt-1 text-xl font-bold text-[#8B1D2C] sm:text-2xl">{t.kpiTemplatesValue}</div>
          </div>
        </div>
      </section>

      {/* 2. Institutional College List: Mobile Stacked Cards (< md) & Desktop Table (>= md) */}
      <section className="rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5">
          <h3 className="text-base font-bold text-slate-900">{t.collegeTableHeading}</h3>
          <span className="text-xs text-slate-600 sm:text-sm">{t.collegeTableSource}</span>
        </div>

        {/* Mobile View (< 768px): Touch-Friendly College Cards */}
        <div className="divide-y divide-slate-200 md:hidden">
          {collegeRows.map(({ college, collegeDisplayName, professorCount, departmentNames }) => (
            <div
              key={college.id}
              onClick={() => onSelectCollegeAndGo(college.id)}
              className="flex cursor-pointer flex-col gap-2 p-4 active:bg-slate-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">{collegeDisplayName}</span>
                <span className="rounded-[3px] bg-slate-100 px-2.5 py-0.5 text-sm font-bold text-[#357A16]">
                  {isLoading ? "–" : professorCount}
                </span>
              </div>
              <p className="text-sm text-slate-600">{departmentNames}</p>
              <button
                type="button"
                onClick={() => onSelectCollegeAndGo(college.id)}
                className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-[3px] border border-[#357A16] bg-white py-2 text-sm font-bold text-[#357A16] hover:bg-[#357A16] hover:text-white"
              >
                <span>{t.viewListBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View (>= 768px): Full Institutional Data Table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-300 bg-[#F1F5F9] font-bold text-slate-800">
                <th scope="col" className="w-20 border-r border-slate-200 px-4 py-3 text-center">{t.colCode}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colCollegeName}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colDepartments}</th>
                <th scope="col" className="w-32 border-r border-slate-200 px-4 py-3 text-center">{t.colFacultyCount}</th>
                <th scope="col" className="w-36 px-4 py-3 text-center">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {collegeRows.map(({ college, collegeDisplayName, professorCount, departmentNames }, idx) => (
                <tr key={college.id} className="hover:bg-slate-50">
                  <td className="border-r border-slate-200 px-4 py-3.5 text-center font-mono text-sm text-slate-600">
                    0{idx + 1}
                  </td>
                  <td className="border-r border-slate-200 px-4 py-3.5 text-base font-bold text-slate-900">
                    {collegeDisplayName}
                  </td>
                  <td className="border-r border-slate-200 px-4 py-3.5 text-sm text-slate-700">
                    {departmentNames}
                  </td>
                  <td className="border-r border-slate-200 px-4 py-3.5 text-center text-base font-bold text-[#357A16]">
                    {isLoading ? "–" : professorCount}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onSelectCollegeAndGo(college.id)}
                      className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#357A16] bg-white px-3 py-1.5 text-sm font-bold text-[#357A16] transition hover:bg-[#357A16] hover:text-white"
                    >
                      <span>{t.viewListBtn}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Standard System Workflow Guide */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[4px] border border-slate-300 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-sm font-bold text-[#357A16]">{t.step1Title}</span>
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{t.step1Desc}</p>
        </div>
        <div className="rounded-[4px] border border-slate-300 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-sm font-bold text-[#357A16]">{t.step2Title}</span>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{t.step2Desc}</p>
        </div>
        <div className="rounded-[4px] border border-slate-300 bg-white p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-sm font-bold text-[#357A16]">{t.step3Title}</span>
            <Database className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{t.step3Desc}</p>
        </div>
      </section>
    </div>
  );
};
