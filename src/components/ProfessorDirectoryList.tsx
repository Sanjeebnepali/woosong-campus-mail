/**
 * @file src/components/ProfessorDirectoryList.tsx
 * @description Renders the Verified Faculty Directory with Full Mobile-First Responsiveness.
 * Automatically adapts to stacked touch-friendly cards on mobile phones (< 768px) while
 * providing the full institutional Data Grid Table and 3-column Card View on desktop.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Copy, Check, Mail, ExternalLink, ArrowRight } from "lucide-react";
import {
  DirectoryViewMode,
  IDepartment,
  IProfessor,
  ProfessorDomainModel,
  SupportedLanguage,
} from "@/types/directory.types";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

interface IProfessorDirectoryListProps {
  professors: IProfessor[];
  departments: IDepartment[];
  selectedProfessor: IProfessor | null;
  viewMode: DirectoryViewMode;
  uiLanguage: SupportedLanguage;
  onSelectProfessorAndOpenStudio: (prof: IProfessor) => void;
  onCopyEmailSuccess: (email: string) => void;
}

/**
 * @component ProfessorDirectoryList
 * @description Responsive institutional faculty directory (Mobile Cards + Desktop Table/Grid).
 */
export const ProfessorDirectoryList: React.FC<IProfessorDirectoryListProps> = ({
  professors,
  departments,
  selectedProfessor,
  viewMode,
  uiLanguage,
  onSelectProfessorAndOpenStudio,
  onCopyEmailSuccess,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const t = useMemo(
    () => new PortalTranslationDictionary(uiLanguage).getStrings(),
    [uiLanguage]
  );
  const localizer = useMemo(
    () => new CatalogLocalizer(uiLanguage),
    [uiLanguage]
  );

  /** Copies the professor's email address to clipboard. */
  const handleCopyEmail = useCallback(
    async (e: React.MouseEvent, prof: IProfessor) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(prof.email);
        setCopiedId(prof.id);
        onCopyEmailSuccess(prof.email);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (err) {
        console.error("Clipboard copy error:", err);
      }
    },
    [onCopyEmailSuccess]
  );

  if (professors.length === 0) {
    return (
      <div className="rounded-[4px] border border-slate-300 bg-white p-8 text-center sm:p-12">
        <p className="text-base font-bold text-slate-800">{t.emptyDirectoryTitle}</p>
        <p className="mt-1.5 text-sm text-slate-600">{t.emptyDirectorySub}</p>
      </div>
    );
  }

  /** Helper renderer for touch-friendly faculty cards (used on mobile AND desktop Card View) */
  const renderCardGrid = (wrapperClass: string) => (
    <div className={wrapperClass}>
      {professors.map((prof) => {
        const model = new ProfessorDomainModel(prof);
        const isSelected = selectedProfessor?.id === prof.id;

        return (
          <div
            key={prof.id}
            onClick={() => onSelectProfessorAndOpenStudio(prof)}
            className={`flex cursor-pointer flex-col justify-between rounded-[4px] border border-t-2 border-t-[#357A16] bg-white shadow-2xs transition ${
              isSelected
                ? "border-[#357A16] ring-1 ring-[#357A16]"
                : "border-slate-300 hover:border-slate-400"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3.5">
                <h3 className="text-base font-bold text-slate-900">
                  {localizer.getProfessorDisplayName(prof)}
                </h3>
                <span className="shrink-0 rounded-[3px] border border-slate-300 bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-[#357A16]">
                  {model.getEmailDomain()}
                </span>
              </div>

              <div className="divide-y divide-slate-200 text-sm">
                <div className="flex">
                  <span className="w-24 shrink-0 border-r border-slate-200 bg-[#F8FAFC] px-3 py-2.5 font-bold text-slate-700">
                    {t.departmentLabel}
                  </span>
                  <span className="break-words px-3 py-2.5 text-slate-900">
                    {localizer.getProfessorDeptName(prof, departments)}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 shrink-0 border-r border-slate-200 bg-[#F8FAFC] px-3 py-2.5 font-bold text-slate-700">
                    {t.colOfficialEmail}
                  </span>
                  <div className="flex flex-1 flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <span className="break-all font-mono font-bold text-[#357A16]">
                      {prof.email}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyEmail(e, prof)}
                      className="shrink-0 rounded-[3px] border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      {copiedId === prof.id ? t.copiedBtn : t.copyBtn}
                    </button>
                  </div>
                </div>
                <div className="flex">
                  <span className="w-24 shrink-0 border-r border-slate-200 bg-[#F8FAFC] px-3 py-2.5 font-bold text-slate-700">
                    {t.colOffice}
                  </span>
                  <span className="break-words px-3 py-2.5 text-slate-800">
                    {localizer.getOfficeLocation(prof)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-24 shrink-0 border-r border-slate-200 bg-[#F8FAFC] px-3 py-2.5 font-bold text-slate-700">
                    {t.colResearch}
                  </span>
                  <span className="break-words px-3 py-2.5 text-slate-700">
                    {localizer.getResearchFields(prof)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <a
                href={prof.source_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t.sourceLinkLabel}</span>
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#357A16] px-4 py-2 text-sm font-bold text-white">
                <Mail className="h-4 w-4" />
                <span>{t.writeEmailBtn}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // If Card View is explicitly chosen, render cards across all screen sizes
  if (viewMode === "grid") {
    return renderCardGrid("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3");
  }

  // Table View: Automatically renders touch-friendly cards on mobile phones (< md) and Data Table on desktop (>= md)
  return (
    <>
      {/* Mobile Phone View (< 768px): Touch-Friendly Stacked Faculty Cards (No Horizontal Scroll!) */}
      <div className="block md:hidden">
        {renderCardGrid("grid grid-cols-1 gap-3.5")}
      </div>

      {/* Tablet & Desktop View (>= 768px): Full Institutional Data Grid Table */}
      <div className="hidden rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white shadow-2xs md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[52px]" />
              <col className="w-[13%]" />
              <col className="w-[17%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
              <col className="w-[19%]" />
              <col className="w-[148px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-300 bg-[#F1F5F9] font-bold text-slate-800">
                <th scope="col" className="border-r border-slate-200 px-2 py-3 text-center">{t.colNo}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colFacultyName}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.departmentLabel}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colOffice}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colOfficialEmail}</th>
                <th scope="col" className="border-r border-slate-200 px-4 py-3">{t.colResearch}</th>
                <th scope="col" className="px-2 py-3 text-center">{t.colCompose}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {professors.map((prof, index) => {
                const isSelected = selectedProfessor?.id === prof.id;
                return (
                  <tr
                    key={prof.id}
                    onClick={() => onSelectProfessorAndOpenStudio(prof)}
                    className={`cursor-pointer transition ${
                      isSelected ? "bg-[#EEF6E8]" : "even:bg-slate-50/50 hover:bg-slate-100/80"
                    }`}
                  >
                    <td className="border-r border-slate-200 px-2 py-3.5 text-center font-mono text-sm text-slate-600">
                      {index + 1}
                    </td>
                    <td className="border-r border-slate-200 px-4 py-3.5 text-base font-bold text-slate-900">
                      {localizer.getProfessorDisplayName(prof)}
                    </td>
                    <td className="border-r border-slate-200 px-4 py-3.5 text-sm text-slate-800">
                      {localizer.getProfessorDeptName(prof, departments)}
                    </td>
                    <td className="border-r border-slate-200 px-4 py-3.5 text-sm text-slate-700">
                      {localizer.getOfficeLocation(prof)}
                    </td>
                    <td className="border-r border-slate-200 px-4 py-3.5 font-mono text-[13px] text-[#357A16]">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="font-bold break-all">{prof.email}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(e, prof)}
                          className="inline-flex items-center gap-1 rounded-[3px] border border-slate-300 bg-white px-2.5 py-1 font-sans text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          {copiedId === prof.id ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedId === prof.id ? t.copiedBtn : t.copyBtn}</span>
                        </button>
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-4 py-3.5 text-sm text-slate-700">
                      {localizer.getResearchFields(prof)}
                    </td>
                    <td className="px-2 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectProfessorAndOpenStudio(prof)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] bg-[#357A16] px-3 py-1.5 text-sm font-bold text-white hover:bg-[#2A6712]"
                      >
                        <span>{t.writeEmailBtn}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
