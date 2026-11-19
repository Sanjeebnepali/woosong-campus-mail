/**
 * @file src/app/page.tsx
 * @description Authentic Institutional Portal Layout modeled after Woosong University
 * Student Information System (wsinfo.wsu.ac.kr) with Full Mobile-First & Keyboard Responsiveness.
 * - Mobile Phones (< 1024px): Compact horizontal top menu strip + Sticky thumb-friendly Bottom Navigation Bar
 * - Desktop (>= 1024px): Full wsinfo Left Navigation Sidebar (LNB)
 * - Keyboard Navigation: Alt+1, Alt+2, Alt+3, Alt+4 switch sections instantly.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { CheckCircle2, AlertCircle, X, Home, Users, Mail, Database, ChevronRight } from "lucide-react";
import { IProfessor, SupportedLanguage } from "@/types/directory.types";
import { useDirectory } from "@/hooks/useDirectory";
import { useEmailComposer } from "@/hooks/useEmailComposer";
import { useToast } from "@/hooks/useToast";
import { NavbarHeader } from "@/components/NavbarHeader";
import { HomeOverviewSection, ActiveAppSection } from "@/components/HomeOverviewSection";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ProfessorDirectoryList } from "@/components/ProfessorDirectoryList";
import { EmailComposerStudio } from "@/components/EmailComposerStudio";
import { PacketFlowWalkthrough } from "@/components/PacketFlowWalkthrough";
import { PrivacyAndAdminModals } from "@/components/PrivacyAndAdminModals";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";

/**
 * @class InstitutionalSidebarMenu
 * @description OOP Menu Configuration Constructor providing the official Left Navigation Bar
 * (LNB) menu structure in pure single-language mode (Korean, English, Chinese, Vietnamese).
 */
class InstitutionalSidebarMenu {
  public readonly lang: SupportedLanguage;

  /** Constructor sets the active UI language. */
  constructor(lang: SupportedLanguage) {
    this.lang = lang;
  }

  public getMenuItems(): Array<{ id: ActiveAppSection; code: string; title: string; subtitle: string }> {
    const t = new PortalTranslationDictionary(this.lang).getStrings();
    return [
      { id: "home", code: "01", title: t.menu01Title, subtitle: t.menu01Sub },
      { id: "directory", code: "02", title: t.menu02Title, subtitle: t.menu02Sub },
      { id: "composer", code: "03", title: t.menu03Title, subtitle: t.menu03Sub },
      { id: "packet_lab", code: "04", title: t.menu04Title, subtitle: t.menu04Sub },
    ];
  }
}

const SKIP_LABEL: Record<SupportedLanguage, string> = {
  ko: "본문 바로가기", en: "Skip to main content", zh: "跳转到主要内容", vi: "Chuyển đến nội dung chính",
};

const FALLBACK_NOTICE: Record<SupportedLanguage, string> = {
  ko: "최신 교원 정보를 불러오지 못해 저장된 예비 목록을 표시하고 있습니다. 일부 정보가 최신이 아닐 수 있습니다.",
  en: "The latest faculty data could not be loaded, so a saved backup list is shown. Some details may be out of date.",
  zh: "无法加载最新教员数据，当前显示的是已保存的备用名单，部分信息可能不是最新。",
  vi: "Không thể tải dữ liệu giảng viên mới nhất nên đang hiển thị danh sách dự phòng; một số thông tin có thể đã cũ.",
};

/**
 * @component CampusMailHomePage
 * @description Main institutional portal controller combining Desktop LNB, Mobile Bottom Nav, and Active Section Workspace.
 */
export default function CampusMailHomePage() {
  const [activeSection, setActiveSection] = useState<ActiveAppSection>("home");
  const [uiLanguage, setUiLanguage] = useState<SupportedLanguage>("ko");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const { toasts, showToast, dismissToast } = useToast();
  const directory = useDirectory();
  const composer = useEmailComposer(directory.selectedProfessor, uiLanguage);

  const t = useMemo(() => new PortalTranslationDictionary(uiLanguage).getStrings(), [uiLanguage]);
  const sidebarConfig = useMemo(() => new InstitutionalSidebarMenu(uiLanguage), [uiLanguage]);
  // The 04 Packet Monitor is a developer/teaching demo: staff-only (/?admin=1), hidden from the public menu
  const allMenuItems = sidebarConfig.getMenuItems();
  const menuItems = isAdminMode ? allMenuItems : allMenuItems.filter((item) => item.id !== "packet_lab");

  // Synchronize HTML lang & block browser auto-translate interference
  useEffect(() => {
    document.documentElement.lang = uiLanguage;
    document.documentElement.setAttribute("translate", "no");
    document.documentElement.classList.add("notranslate");
  }, [uiLanguage]);

  // Faculty registration is staff-only: the button appears only on /?admin=1 (the API also requires the admin key)
  useEffect(() => {
    setIsAdminMode(new URLSearchParams(window.location.search).get("admin") === "1");
  }, []);

  // Keyboard shortcuts: Alt+1..4 switches sections immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "1") { e.preventDefault(); setActiveSection("home"); }
      if (e.key === "2") { e.preventDefault(); setActiveSection("directory"); }
      if (e.key === "3") { e.preventDefault(); setActiveSection("composer"); }
      if (e.key === "4" && isAdminMode) { e.preventDefault(); setActiveSection("packet_lab"); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminMode]);

  const handleSelectCollegeAndGo = useCallback((collegeId: number) => {
    directory.setSelectedCollegeId(collegeId);
    setActiveSection("directory");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [directory]);

  const handleSelectProfessorAndOpenStudio = useCallback((prof: IProfessor) => {
    directory.setSelectedProfessor(prof);
    setActiveSection("composer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [directory]);

  const handleTriggerAI = useCallback(async () => {
    const ok = await composer.triggerAIRefinement();
    showToast(t.verifyAndLogBtn, ok ? "success" : "info");
  }, [composer, showToast, t]);

  const getMenuIcon = (id: ActiveAppSection) => {
    if (id === "home") return <Home className="h-4 w-4 shrink-0" />;
    if (id === "directory") return <Users className="h-4 w-4 shrink-0" />;
    if (id === "composer") return <Mail className="h-4 w-4 shrink-0" />;
    return <Database className="h-4 w-4 shrink-0" />;
  };

  return (
    <div translate="no" className="notranslate flex min-h-screen flex-col bg-[#F7F9FA] pb-16 text-slate-900 lg:pb-0">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-[3px] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-[#357A16] focus:shadow-lg">{SKIP_LABEL[uiLanguage]}</a>

      <NavbarHeader
        uiLanguage={uiLanguage}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onChangeLanguage={setUiLanguage}
        dataSource={directory.dataSource}
        isLoading={directory.isLoading}
        showAdminButton={isAdminMode}
        totalProfessors={directory.professors.length}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Portal Layout: Desktop Left Sidebar (LNB) + Dedicated Content Pane */}
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-3 py-4 sm:px-6 sm:py-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block" aria-label={t.sidebarHeaderTitle}>
          <div className="rounded-[4px] border border-slate-300 bg-white shadow-2xs">
            <div className="bg-[#2F3033] px-4 py-3.5 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-200">{t.sidebarTopTag}</div>
              <div className="mt-0.5 text-base font-bold">{t.sidebarHeaderTitle}</div>
            </div>
            <nav aria-label={t.sidebarHeaderTitle} className="divide-y divide-slate-200">
              {menuItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition ${
                      isActive ? "border-l-4 border-l-[#357A16] bg-slate-100 font-bold text-[#357A16]" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-slate-600">{getMenuIcon(item.id)}</span>
                      <div>
                        <div className="text-sm font-bold">{item.code}. {item.title}</div>
                        <div className="mt-0.5 text-xs font-normal text-slate-600">{item.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <div className="font-bold text-slate-900">{t.dbInfoTitle}</div>
              <div className="mt-1.5 space-y-1">
                <div>{t.dbInfoLine1}</div>
                <div>{t.dbInfoLine2}</div>
                <div>{t.dbInfoLine3}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Main Content Workspace */}
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {!directory.isLoading && directory.dataSource === "local-verified-seed" && (
            <div role="status" className="mb-4 rounded-[4px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {FALLBACK_NOTICE[uiLanguage]}
            </div>
          )}
          {activeSection === "home" && (
            <HomeOverviewSection
              uiLanguage={uiLanguage}
              colleges={directory.colleges}
              departments={directory.departments}
              professors={directory.professors}
              isLoading={directory.isLoading}
              onNavigateSection={setActiveSection}
              onSelectCollegeAndGo={handleSelectCollegeAndGo}
            />
          )}

          {activeSection === "directory" && (
            <div className="space-y-4">
              <SearchFilterBar
                uiLanguage={uiLanguage}
                colleges={directory.colleges}
                visibleDepartments={directory.visibleDepartments}
                selectedCollegeId={directory.selectedCollegeId}
                selectedDepartmentId={directory.selectedDepartmentId}
                searchQuery={directory.searchQuery}
                viewMode={directory.viewMode}
                resultCount={directory.filteredProfessors.length}
                onSelectCollege={directory.setSelectedCollegeId}
                onSelectDepartment={directory.setSelectedDepartmentId}
                onSearchChange={directory.setSearchQuery}
                onViewModeChange={directory.setViewMode}
              />
              <ProfessorDirectoryList
                professors={directory.filteredProfessors}
                departments={directory.departments}
                selectedProfessor={directory.selectedProfessor}
                viewMode={directory.viewMode}
                uiLanguage={uiLanguage}
                onSelectProfessorAndOpenStudio={handleSelectProfessorAndOpenStudio}
                onCopyEmailSuccess={(email) => showToast(`${t.copiedBtn}: ${email}`, "success")}
              />
            </div>
          )}

          {activeSection === "composer" && (
            <EmailComposerStudio
              uiLanguage={uiLanguage}
              onChangeUiLanguage={setUiLanguage}
              professors={directory.professors}
              selectedProfessor={directory.selectedProfessor}
              onSelectProfessor={directory.setSelectedProfessor}
              formInput={composer.formInput}
              onUpdateField={composer.updateField}
              editableSubject={composer.editableSubject}
              onChangeSubject={composer.setEditableSubject}
              editableBody={composer.editableBody}
              onChangeBody={composer.setEditableBody}
              etiquetteChecklist={composer.etiquetteChecklist}
              wordCount={composer.wordCount}
              isGeneratingAI={composer.isGeneratingAI}
              onTriggerAI={handleTriggerAI}
              mailLauncher={composer.mailLauncher}
              onCopyAllSuccess={() => showToast(t.copiedBtn, "success")}
              onBackToDirectory={() => setActiveSection("directory")}
              onGoToPacketLab={isAdminMode ? () => setActiveSection("packet_lab") : undefined}
            />
          )}

          {activeSection === "packet_lab" && isAdminMode && (
            <PacketFlowWalkthrough
              uiLanguage={uiLanguage}
              selectedProfessor={directory.selectedProfessor}
              formInput={composer.formInput}
              editableSubject={composer.editableSubject}
              editableBody={composer.editableBody}
            />
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Thumb Navigation Bar (< 1024px) */}
      <nav aria-label={t.sidebarHeaderTitle} style={{ gridTemplateColumns: `repeat(${menuItems.length}, minmax(0, 1fr))` }} className="fixed right-0 bottom-0 left-0 z-40 grid border-t border-slate-300 bg-white shadow-lg lg:hidden">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                setActiveSection(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-center transition ${
                isActive ? "bg-[#357A16] font-bold text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {getMenuIcon(item.id)}
              <span className="line-clamp-2 max-w-full px-1 text-[11px] leading-tight font-bold">{item.title}</span>
            </button>
          );
        })}
      </nav>

      <PrivacyAndAdminModals
        uiLanguage={uiLanguage}
        departments={directory.departments}
        selectedProfessor={directory.selectedProfessor}
        isAdminOpen={isAdminModalOpen}
        isPrivacyOpen={isPrivacyModalOpen}
        onCloseAdmin={() => setIsAdminModalOpen(false)}
        onClosePrivacy={() => setIsPrivacyModalOpen(false)}
        onSuccessRefresh={(msg) => {
          showToast(msg, "success");
          directory.refreshDirectory();
        }}
        onErrorToast={(msg) => showToast(msg, "error")}
      />

      <div role="status" aria-live="polite" className="fixed right-4 bottom-20 z-50 flex flex-col gap-2 lg:bottom-4">
        {toasts.map((tItem) => (
          <div key={tItem.id} className={`flex items-center gap-2 rounded-[4px] border px-4 py-3 text-sm font-bold shadow-md ${tItem.variant === "error" ? "border-red-800 bg-red-700 text-white" : "border-[#2F3033] bg-[#2F3033] text-white"}`}>
            {tItem.variant === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{tItem.title}</span>
            <button type="button" aria-label="Close" onClick={() => dismissToast(tItem.id)} className="ml-2 text-slate-300 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <footer className="border-t border-slate-300 bg-white py-4 text-center text-sm text-slate-600">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-2 px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/woosong-logo.svg" alt="Woosong University" className="h-12 w-auto sm:h-14" />
          <span>{t.footerCompliance}</span>
        </div>
      </footer>
    </div>
  );
}
