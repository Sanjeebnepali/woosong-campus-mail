/**
 * @file src/components/EmailComposerStudio.tsx
 * @description Official Institutional Academic Email Document Composer Page.
 * Synchronizes language selection with `onChangeUiLanguage` so changing the language
 * inside the Email Composer translates ALL website navigation buttons, labels, AND the email!
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useMemo, useEffect } from "react";
import { Send, Copy, CheckCircle, ExternalLink, ArrowLeft, Database, RefreshCw } from "lucide-react";
import { EmailDraftLanguage, EmailPurpose, EmailTone, IEmailFormInput, IProfessor, SupportedLanguage } from "@/types/directory.types";
import { MailLauncherService } from "@/services/MailLauncherService";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

/**
 * @class ComposerPurposeCatalog
 * @description OOP Catalog with constructor returning 100% pure single-language
 * academic purpose labels and draft language choices in Korean, English, Chinese, and Vietnamese.
 */
class ComposerPurposeCatalog {
  private readonly lang: SupportedLanguage;

  /** Constructor initializes the catalog with the active UI language. */
  constructor(lang: SupportedLanguage) {
    this.lang = lang;
  }

  public getPurposes(): Array<{ id: EmailPurpose; label: string }> {
    const map: Record<SupportedLanguage, Array<{ id: EmailPurpose; label: string }>> = {
      ko: [
        { id: "appointment", label: "면담 신청" },
        { id: "absence", label: "유고·공결 신청" },
        { id: "assignment", label: "과제·수업 질의" },
        { id: "grade", label: "성적·평가 문의" },
        { id: "research_lab", label: "연구실·학부연구생 지원" },
      ],
      zh: [
        { id: "appointment", label: "预约面谈" },
        { id: "absence", label: "请假说明" },
        { id: "assignment", label: "作业与课程咨询" },
        { id: "grade", label: "成绩与评估反馈" },
        { id: "research_lab", label: "实验室与科研申请" },
      ],
      vi: [
        { id: "appointment", label: "Xin lịch hẹn gặp" },
        { id: "absence", label: "Xin phép nghỉ học" },
        { id: "assignment", label: "Hỏi về bài tập" },
        { id: "grade", label: "Phản hồi điểm số" },
        { id: "research_lab", label: "Xin vào phòng nghiên cứu" },
      ],
      en: [
        { id: "appointment", label: "Office Hours Request" },
        { id: "absence", label: "Absence / Sick Leave" },
        { id: "assignment", label: "Assignment Inquiry" },
        { id: "grade", label: "Grade Feedback" },
        { id: "research_lab", label: "Research Lab Inquiry" },
      ],
    };
    return map[this.lang] || map.ko;
  }

  public getDraftLanguageOptions(): Array<{ code: EmailDraftLanguage; label: string }> {
    const map: Record<SupportedLanguage, Array<{ code: EmailDraftLanguage; label: string }>> = {
      ko: [{ code: "ko", label: "한국어 (존댓말 표준)" }, { code: "en", label: "영어 (학술 표준)" }, { code: "zh", label: "중국어 (학술 표준)" }, { code: "vi", label: "베트남어 (학술 표준)" }],
      zh: [{ code: "zh", label: "中文（标准学术格式）" }, { code: "ko", label: "韩语（标准敬语格式）" }, { code: "en", label: "英语（标准学术格式）" }, { code: "vi", label: "越南语（标准学术格式）" }],
      vi: [{ code: "vi", label: "Tiếng Việt (Chuẩn học thuật)" }, { code: "ko", label: "Tiếng Hàn (Kính ngữ học thuật)" }, { code: "en", label: "Tiếng Anh (Chuẩn học thuật)" }, { code: "zh", label: "Tiếng Trung (Chuẩn học thuật)" }],
      en: [{ code: "en", label: "English (Polite Academic)" }, { code: "ko", label: "Korean (Formal Honorific)" }, { code: "zh", label: "Chinese (Formal Academic)" }, { code: "vi", label: "Vietnamese (Formal Academic)" }],
    };
    return map[this.lang] || map.ko;
  }

  public getDetailsPlaceholder(purpose: EmailPurpose): string {
    if (this.lang === "zh") return "请输入具体咨询事由或请假原因";
    if (this.lang === "vi") return "Nhập lý do cụ thể hoặc nội dung cần hỏi giáo sư";
    if (this.lang !== "ko") return "Enter specific academic context or reason for inquiry";
    const map: Record<EmailPurpose, string> = {
      appointment: "예: 데이터베이스 팀 프로젝트 설계 검토 및 자문 요청",
      absence: "예: 병원 진료로 인한 부득이한 결석 및 진료확인서 제출 안내",
      assignment: "예: 3주차 과제 요구사항 중 정규화 적용 기준 질의",
      grade: "예: 기말 프로젝트 평가 항목 중 보완 사항 피드백 확인 요청",
      research_lab: "예: 인공지능·빅데이터 연구실 학부연구생 지원 및 면담 가능 여부 문의",
    };
    return map[purpose];
  }
}

interface IEmailComposerStudioProps {
  uiLanguage: SupportedLanguage;
  onChangeUiLanguage: (lang: SupportedLanguage) => void;
  professors: IProfessor[];
  selectedProfessor: IProfessor | null;
  onSelectProfessor: (prof: IProfessor) => void;
  formInput: IEmailFormInput;
  onUpdateField: <K extends keyof IEmailFormInput>(field: K, value: IEmailFormInput[K]) => void;
  editableSubject: string;
  onChangeSubject: (val: string) => void;
  editableBody: string;
  onChangeBody: (val: string) => void;
  etiquetteChecklist: string[];
  wordCount: number;
  isGeneratingAI: boolean;
  onTriggerAI: () => void;
  mailLauncher: MailLauncherService;
  onCopyAllSuccess: () => void;
  onBackToDirectory: () => void;
  onGoToPacketLab?: () => void;
}

/**
 * @component EmailComposerStudio
 * @description Mobile-first and keyboard-responsive institutional email form and preview panel.
 */
export const EmailComposerStudio: React.FC<IEmailComposerStudioProps> = (props) => {
  const {
    uiLanguage, onChangeUiLanguage, professors, selectedProfessor, onSelectProfessor, formInput,
    onUpdateField, editableSubject, onChangeSubject, editableBody, onChangeBody,
    etiquetteChecklist, wordCount, isGeneratingAI, onTriggerAI, mailLauncher,
    onCopyAllSuccess, onBackToDirectory, onGoToPacketLab,
  } = props;

  const t = useMemo(() => new PortalTranslationDictionary(uiLanguage).getStrings(), [uiLanguage]);
  const catalog = useMemo(() => new ComposerPurposeCatalog(uiLanguage), [uiLanguage]);
  const localizer = useMemo(() => new CatalogLocalizer(uiLanguage), [uiLanguage]);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        await navigator.clipboard.writeText(mailLauncher.getFormattedClipboardText());
        onCopyAllSuccess();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mailLauncher, onCopyAllSuccess]);

  if (!selectedProfessor) {
    return (
      <div className="rounded-[4px] border border-slate-300 bg-white p-8 text-center sm:p-12">
        <p className="text-base font-bold text-slate-800">{t.emptyDirectoryTitle}</p>
        <button type="button" onClick={onBackToDirectory} className="mt-4 inline-flex items-center gap-2 rounded-[4px] bg-[#357A16] px-4 py-2.5 text-sm font-bold text-white">
          <ArrowLeft className="h-4 w-4" /><span>{t.backToDirectoryBtn}</span>
        </button>
      </div>
    );
  }

  const handleCopyFullDraft = async () => {
    await navigator.clipboard.writeText(mailLauncher.getFormattedClipboardText());
    onCopyAllSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2.5 rounded-[4px] border border-slate-300 bg-white p-3.5 sm:flex-row sm:items-center sm:px-5">
        <button type="button" onClick={onBackToDirectory} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-[#357A16]">
          <ArrowLeft className="h-4 w-4 shrink-0" /><span>{t.backToDirectoryBtn}</span>
        </button>
        {onGoToPacketLab && (
        <button type="button" onClick={onGoToPacketLab} className="inline-flex items-center justify-center gap-1.5 rounded-[3px] border border-[#357A16] bg-slate-50 px-3.5 py-2 text-sm font-bold text-[#357A16] hover:bg-[#357A16] hover:text-white">
          <Database className="h-4 w-4 shrink-0" /><span>{t.goToPacketLabBtn}</span>
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT COLUMN (5 Cols): Institutional Input Form Table */}
        <div className="rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white lg:col-span-5">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
            <h3 className="text-base font-bold text-slate-900">{t.senderPanelTitle}</h3>
          </div>
          <div className="divide-y divide-slate-200 text-sm">
            <div className="p-4">
              <label className="mb-1.5 block font-bold text-slate-800">{t.recipientLabel}</label>
              <select
                value={selectedProfessor.id}
                onChange={(e) => {
                  const found = professors.find((p) => p.id === Number(e.target.value));
                  if (found) onSelectProfessor(found);
                }}
                className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base font-bold text-slate-900 focus:border-[#357A16] focus:outline-none sm:text-sm"
              >
                {professors.map((p) => (
                  <option key={p.id} value={p.id}>{localizer.getProfessorDisplayName(p)} ({p.email})</option>
                ))}
              </select>
            </div>

            <div className="p-4">
              <label className="mb-2 block font-bold text-slate-800">{t.purposeCategoryLabel}</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {catalog.getPurposes().map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateField("purpose", item.id)}
                    className={`rounded-[3px] border px-3 py-2.5 text-left text-sm font-bold transition ${
                      formInput.purpose === item.id ? "border-[#357A16] bg-[#357A16] text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-bold text-slate-800">{t.draftLanguageLabel}</label>
                <select
                  value={formInput.language}
                  onChange={(e) => {
                    const nextLang = e.target.value as EmailDraftLanguage;
                    onUpdateField("language", nextLang);
                    onChangeUiLanguage(nextLang);
                  }}
                  className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base font-semibold sm:text-sm"
                >
                  {catalog.getDraftLanguageOptions().map((opt) => (
                    <option key={opt.code} value={opt.code}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-bold text-slate-800">{t.draftToneLabel}</label>
                <select value={formInput.tone} onChange={(e) => onUpdateField("tone", e.target.value as EmailTone)} className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base font-semibold sm:text-sm">
                  <option value="formal">{t.toneFormalOption}</option>
                  <option value="polite">{t.tonePoliteOption}</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <label className="block font-bold text-slate-800">{t.studentInfoLabel}</label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <input type="text" enterKeyHint="next" value={formInput.studentName} onChange={(e) => onUpdateField("studentName", e.target.value)} placeholder={t.inputNamePlaceholder} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base focus:border-[#357A16] focus:outline-none sm:text-sm" />
                <input type="text" inputMode="numeric" enterKeyHint="next" value={formInput.studentId} onChange={(e) => onUpdateField("studentId", e.target.value)} placeholder={t.inputIdPlaceholder} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base focus:border-[#357A16] focus:outline-none sm:text-sm" />
                <input type="text" enterKeyHint="next" value={formInput.courseName} onChange={(e) => onUpdateField("courseName", e.target.value)} placeholder={t.inputCoursePlaceholder} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base focus:border-[#357A16] focus:outline-none sm:text-sm" />
                <input type="text" enterKeyHint="next" value={formInput.preferredTimeSlot} onChange={(e) => onUpdateField("preferredTimeSlot", e.target.value)} placeholder={t.inputTimePlaceholder} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base focus:border-[#357A16] focus:outline-none sm:text-sm" />
              </div>
              <textarea rows={3} enterKeyHint="done" value={formInput.keyDetails} onChange={(e) => onUpdateField("keyDetails", e.target.value)} placeholder={catalog.getDetailsPlaceholder(formInput.purpose)} className="w-full rounded-[3px] border border-slate-300 p-3 text-base focus:border-[#357A16] focus:outline-none sm:text-sm" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 Cols): Official Email Document Preview & Transmission */}
        <div className="flex flex-col justify-between rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
              <h3 className="text-base font-bold text-slate-900">{t.previewPanelTitle}</h3>
              <button type="button" onClick={onTriggerAI} disabled={isGeneratingAI} className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#357A16] bg-white px-3 py-1.5 text-sm font-bold text-[#357A16] hover:bg-[#357A16] hover:text-white disabled:opacity-50">
                <RefreshCw className="h-3.5 w-3.5" /><span>{isGeneratingAI ? "..." : t.verifyAndLogBtn}</span>
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-800">{t.subjectFieldLabel}</label>
                <textarea rows={2} value={editableSubject} onChange={(e) => onChangeSubject(e.target.value)} className="w-full resize-none break-words rounded-[3px] border-2 border-[#357A16]/40 bg-sky-50/40 px-3.5 py-2.5 text-base font-bold leading-snug text-slate-900 focus:border-[#357A16] focus:bg-white focus:outline-none" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-slate-800">{t.bodyFieldLabel}</label>
                <textarea rows={12} value={editableBody} onChange={(e) => onChangeBody(e.target.value)} className="w-full rounded-[3px] border border-slate-300 bg-white p-3.5 text-base leading-relaxed text-slate-800 focus:border-[#357A16] focus:outline-none" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 text-sm text-slate-600">
                <div className="flex flex-wrap gap-3">
                  {etiquetteChecklist.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 font-medium text-slate-800">
                      <CheckCircle className="h-4 w-4 shrink-0 text-[#357A16]" /><span>{item}</span>
                    </span>
                  ))}
                </div>
                <span className="font-mono font-bold text-slate-700">{wordCount} {t.wordCountUnit}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <a href={mailLauncher.getMailtoUri()} className="inline-flex items-center justify-center gap-1.5 rounded-[3px] bg-[#357A16] px-4 py-3.5 text-sm font-bold text-white hover:bg-[#2A6712]">
              <Send className="h-4 w-4 shrink-0" /><span>{t.sendDefaultMailBtn}</span>
            </a>
            <a href={mailLauncher.getGmailWebUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-[3px] border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-100">
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-600" /><span>{t.sendGmailBtn}</span>
            </a>
            <a href={mailLauncher.getNaverMailWebUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-[3px] border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-100">
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-600" /><span>{t.sendNaverBtn}</span>
            </a>
            <button type="button" onClick={handleCopyFullDraft} className="inline-flex items-center justify-center gap-1.5 rounded-[3px] bg-slate-800 px-4 py-3.5 text-sm font-bold text-white hover:bg-slate-900">
              <Copy className="h-4 w-4 shrink-0" /><span>{t.copyFullEmailBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
