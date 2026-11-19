/**
 * @file src/components/NavbarHeader.tsx
 * @description Authentic Institutional Top Header with a Prominent 4-Language Switcher Bar
 * so any student who does not understand English can immediately recognize their native
 * language (한국어, English, 中文, Tiếng Việt) and switch the entire website UI in 1 click.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useMemo } from "react";
import { Database, Globe, UserPlus, FileEdit } from "lucide-react";
import { SupportedLanguage } from "@/types/directory.types";
import { ActiveAppSection } from "@/components/HomeOverviewSection";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";

/**
 * @class HeaderBreadcrumbBuilder
 * @description OOP Breadcrumb Constructor that generates pure single-language section paths.
 */
class HeaderBreadcrumbBuilder {
  private readonly lang: SupportedLanguage;

  /** Constructor binds the active portal language. */
  constructor(lang: SupportedLanguage) {
    this.lang = lang;
  }

  public getBreadcrumb(section: ActiveAppSection): string {
    const t = new PortalTranslationDictionary(this.lang).getStrings();
    const map: Record<ActiveAppSection, string> = {
      home: `01. ${t.menu01Title} — ${t.menu01Sub}`,
      directory: `02. ${t.menu02Title} — ${t.menu02Sub}`,
      composer: `03. ${t.menu03Title} — ${t.menu03Sub}`,
      packet_lab: `04. ${t.menu04Title} — ${t.menu04Sub}`,
    };
    return map[section];
  }
}

interface INavbarHeaderProps {
  uiLanguage: SupportedLanguage;
  activeSection: ActiveAppSection;
  onSelectSection: (section: ActiveAppSection) => void;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  dataSource: "neon-postgresql" | "local-verified-seed";
  isLoading: boolean;
  showAdminButton: boolean;
  totalProfessors: number;
  onOpenAdminModal: () => void;
  onOpenPrivacyModal: () => void;
}

/**
 * @component NavbarHeader
 * @description Renders the official 2-tier university portal header with a prominent
 * 4-language selector bar that translates every button, menu, and instruction on the site.
 */
export const NavbarHeader: React.FC<INavbarHeaderProps> = ({
  uiLanguage,
  activeSection,
  onSelectSection,
  onChangeLanguage,
  dataSource,
  isLoading,
  showAdminButton,
  totalProfessors,
  onOpenAdminModal,
  onOpenPrivacyModal,
}) => {
  const t = useMemo(
    () => new PortalTranslationDictionary(uiLanguage).getStrings(),
    [uiLanguage]
  );
  const breadcrumb = useMemo(
    () => new HeaderBreadcrumbBuilder(uiLanguage).getBreadcrumb(activeSection),
    [uiLanguage, activeSection]
  );

  const languageButtons: Array<{ code: SupportedLanguage; nativeLabel: string }> = [
    { code: "ko", nativeLabel: "한국어" },
    { code: "en", nativeLabel: "English" },
    { code: "zh", nativeLabel: "中文" },
    { code: "vi", nativeLabel: "Tiếng Việt" },
  ];

  return (
    <header className="z-30 border-b border-slate-300 bg-white shadow-2xs lg:sticky lg:top-0">
      {/* Tier 1: Official Dark Navy University Utility Strip (#2F3033) with 4 Big Language Buttons */}
      <div className="bg-[#151515] text-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col justify-between gap-2 px-3 py-2 text-sm sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-3 font-bold tracking-wide text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/woosong-compact-dark.svg" alt="Woosong University" className="h-9 w-auto sm:h-10" />
              <span className="text-lg sm:text-xl">{t.universityName}</span>
            </span>
            <span className="hidden text-slate-400 md:inline">|</span>
            <span className="hidden text-slate-200 md:inline">
              {t.portalSubName}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`${!isLoading && dataSource === "neon-postgresql" ? "hidden xl:inline-flex" : "hidden"} items-center gap-1.5 text-sm text-slate-200`}>
              <Database className="h-4 w-4 text-sky-300" />
              <span>
                {t.dbStatusConnected} ({totalProfessors})
              </span>
            </span>

            {/* Prominent 4-Language Selector Buttons (Always visible in native script) */}
            <div className="grid w-full grid-cols-4 gap-1 rounded-[4px] bg-black p-1 sm:flex sm:w-auto sm:items-center">
              <Globe aria-hidden="true" className="ml-1.5 hidden h-4 w-4 text-sky-300 sm:inline-block" />
              {languageButtons.map((opt) => {
                const isSelected = uiLanguage === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    lang={opt.code}
                    aria-pressed={isSelected}
                    onClick={() => onChangeLanguage(opt.code)}
                    className={`rounded-[3px] px-3 py-1.5 text-center text-xs font-bold transition sm:text-sm ${
                      isSelected
                        ? "bg-[#62B224] text-[#111418] shadow-2xs"
                        : "text-slate-100 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {opt.nativeLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Portal Header & Administrative Action Buttons */}
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onSelectSection("home")}
          className="flex items-center gap-3 border-l-4 border-[#357A16] pl-3 text-left"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                {t.systemMainTitle}
              </h1>
              <span className="rounded-[3px] border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-bold text-[#357A16]">
                {t.systemBadge}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-600 sm:text-sm">
              {breadcrumb}
            </p>
          </div>
        </button>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {showAdminButton && (
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-[#357A16] bg-[#357A16] px-3.5 py-2 text-sm font-bold text-white transition hover:bg-[#2A6712] sm:flex-initial"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>{t.registerFacultyBtn}</span>
          </button>
          )}

          <button
            type="button"
            onClick={onOpenPrivacyModal}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:flex-initial"
          >
            <FileEdit className="h-4 w-4 shrink-0 text-slate-600" />
            <span>{t.dataRequestBtn}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
