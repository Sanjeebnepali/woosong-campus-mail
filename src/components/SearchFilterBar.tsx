/**
 * @file src/components/SearchFilterBar.tsx
 * @description Official Institutional Search Criteria Panel ("조회 조건") modeled after
 * Woosong University Student Information System (wsinfo.wsu.ac.kr).
 * Enforces 100% pure single-language rendering across Korean, English, Chinese, and Vietnamese.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Search, RotateCcw, Table as TableIcon, LayoutGrid } from "lucide-react";
import {
  DirectoryViewMode,
  ICollege,
  IDepartment,
  SupportedLanguage,
} from "@/types/directory.types";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

interface ISearchFilterBarProps {
  uiLanguage: SupportedLanguage;
  colleges: ICollege[];
  visibleDepartments: IDepartment[];
  selectedCollegeId: number | null;
  selectedDepartmentId: number | null;
  searchQuery: string;
  viewMode: DirectoryViewMode;
  resultCount: number;
  onSelectCollege: (id: number | null) => void;
  onSelectDepartment: (id: number | null) => void;
  onSearchChange: (q: string) => void;
  onViewModeChange: (mode: DirectoryViewMode) => void;
}

/**
 * @component SearchFilterBar
 * @description Renders an authentic wsinfo-style structured search condition table
 * in 100% pure single-language mode.
 */
export const SearchFilterBar: React.FC<ISearchFilterBarProps> = ({
  uiLanguage,
  colleges,
  visibleDepartments,
  selectedCollegeId,
  selectedDepartmentId,
  searchQuery,
  viewMode,
  resultCount,
  onSelectCollege,
  onSelectDepartment,
  onSearchChange,
  onViewModeChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const t = useMemo(
    () => new PortalTranslationDictionary(uiLanguage).getStrings(),
    [uiLanguage]
  );
  const localizer = useMemo(
    () => new CatalogLocalizer(uiLanguage),
    [uiLanguage]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResetFilters = () => {
    onSelectCollege(null);
    onSelectDepartment(null);
    onSearchChange("");
  };

  return (
    <section className="rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white shadow-2xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-900">{t.searchPanelTitle}</h2>
          <span className="whitespace-nowrap text-sm font-bold text-[#357A16]">
            [ {t.totalResultsLabel}: {resultCount} ]
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Table/card toggle only matters from tablet up: phones always show cards */}
          <div className="hidden rounded-[3px] border border-slate-300 bg-white md:inline-flex">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold ${
                viewMode === "table"
                  ? "bg-[#357A16] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <TableIcon className="h-4 w-4" />
              <span>{t.tableViewLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={`inline-flex items-center gap-1.5 border-l border-slate-300 px-3 py-1.5 text-sm font-bold ${
                viewMode === "grid"
                  ? "bg-[#357A16] text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>{t.cardViewLabel}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.resetFilterBtn}</span>
          </button>
        </div>
      </div>

      {/* Structured Institutional Search Condition Form Grid */}
      <div className="grid grid-cols-1 divide-y divide-slate-200 text-sm md:grid-cols-12 md:divide-y-0">
        {/* Field 1: College Selector (4 cols) */}
        <div className="flex items-center md:col-span-4 md:border-r md:border-slate-200">
          <label className="w-28 shrink-0 border-r border-slate-200 bg-[#F1F5F9] px-3.5 py-3.5 font-bold text-slate-800">
            {t.collegeLabel}
          </label>
          <div className="flex-1 px-3 py-2">
            <select
              value={selectedCollegeId ?? ""}
              onChange={(e) =>
                onSelectCollege(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#357A16] focus:outline-none"
            >
              <option value="">{t.allCollegesOption}</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {localizer.getCollegeName(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 2: Department Selector (4 cols) */}
        <div className="flex items-center md:col-span-4 md:border-r md:border-slate-200">
          <label className="w-28 shrink-0 border-r border-slate-200 bg-[#F1F5F9] px-3.5 py-3.5 font-bold text-slate-800">
            {t.departmentLabel}
          </label>
          <div className="flex-1 px-3 py-2">
            <select
              value={selectedDepartmentId ?? ""}
              onChange={(e) =>
                onSelectDepartment(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#357A16] focus:outline-none"
            >
              <option value="">{t.allDepartmentsOption}</option>
              {visibleDepartments.map((d) => (
                <option key={d.id} value={d.id}>
                  {localizer.getDepartmentName(d)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 3: Keyword Search Input (4 cols) */}
        <div className="flex items-center md:col-span-4">
          <label className="w-28 shrink-0 border-r border-slate-200 bg-[#F1F5F9] px-3.5 py-3.5 font-bold text-slate-800">
            {t.keywordLabel}
          </label>
          <div className="relative flex-1 px-3 py-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.keywordPlaceholder}
              className="w-full rounded-[3px] border border-slate-300 bg-white py-2 pr-9 pl-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#357A16] focus:outline-none"
            />
            <Search className="pointer-events-none absolute top-1/2 right-5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>
    </section>
  );
};
