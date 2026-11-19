/**
 * @file src/components/PrivacyAndAdminModals.tsx
 * @description Production Modals for Admin Faculty Registration and PIPA Data Requests.
 * Features complete Modal Effectiveness & Keyboard Responsiveness:
 * - Escape key to close
 * - Backdrop click to dismiss
 * - Body scroll lock while open
 * - Mobile dynamic viewport height (max-h-[88dvh] overflow-y-auto) so virtual keyboards never block buttons
 * - 16px (text-base) inputs to prevent mobile browser auto-zoom glitches.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, UserPlus, FileEdit } from "lucide-react";
import { IDepartment, IProfessor, SupportedLanguage } from "@/types/directory.types";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

/**
 * @class ModalApiService
 * @description OOP Service class with constructor for submitting Admin & Privacy forms
 * and returning pure single-language modal labels.
 */
class ModalApiService {
  private readonly baseUrl: string;
  private readonly lang: SupportedLanguage;

  /** Constructor sets the base API path and active portal language. */
  constructor(lang: SupportedLanguage, baseUrl: string = "/api") {
    this.lang = lang;
    this.baseUrl = baseUrl;
  }

  public async submitNewProfessor(payload: Record<string, unknown>, adminKey: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${this.baseUrl}/directory`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data.error };
  }

  public async submitPrivacyRequest(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${this.baseUrl}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data.error };
  }

  public getLabels() {
    if (this.lang === "ko") {
      return {
        adminTitle: "교원 정보 신규 등록",
        adminKeyPlaceholder: "관리자 인증키",
        deptLabel: "소속 학과 선택",
        nameKoPlaceholder: "국문 성명",
        nameEnPlaceholder: "영문 성명",
        emailPlaceholder: "공식 학교 이메일",
        officePlaceholder: "연구실 위치",
        researchPlaceholder: "주요 연구 분야",
        saveBtn: "데이터베이스에 저장하기",
        cancelBtn: "취소 (ESC)",
        privacyTitle: "교원 정보 정정 및 삭제 신청",
        optUpdate: "정보 수정 신청",
        optRemove: "노출 제외 및 삭제 신청",
        optAdd: "신규 교원 추가 요청",
        roleProf: "교원 본인",
        roleStudent: "재학생",
        roleStaff: "학과 조교 및 교직원",
        detailsPlaceholder: "수정이 필요한 이메일, 연구실 호수 또는 삭제 요청 사유를 입력해 주십시오.",
        submitReqBtn: "신청서 접수하기",
        savedMsg: "데이터베이스에 정상 등록되었습니다.",
        reqSavedMsg: "정정 및 삭제 신청이 접수되었습니다.",
      };
    }
    if (this.lang === "zh") {
      return {
        adminTitle: "新增认证教员信息",
        adminKeyPlaceholder: "管理员密钥",
        deptLabel: "选择所属专业",
        nameKoPlaceholder: "韩文姓名",
        nameEnPlaceholder: "英文姓名",
        emailPlaceholder: "学校官方邮箱",
        officePlaceholder: "办公室位置",
        researchPlaceholder: "主要研究领域",
        saveBtn: "保存至数据库",
        cancelBtn: "取消 (ESC)",
        privacyTitle: "教员信息修改与删除申请",
        optUpdate: "申请修改信息",
        optRemove: "申请隐藏或删除",
        optAdd: "申请新增教员",
        roleProf: "教授本人",
        roleStudent: "在校学生",
        roleStaff: "行政教职工",
        detailsPlaceholder: "请详细填写需要更新的邮箱、办公室房间号或删除原因。",
        submitReqBtn: "提交申请",
        savedMsg: "新教员信息已成功保存至数据库。",
        reqSavedMsg: "您的信息修改申请已成功提交。",
      };
    }
    if (this.lang === "vi") {
      return {
        adminTitle: "Đăng Ký Thông Tin Giảng Viên Mới",
        adminKeyPlaceholder: "Khóa quản trị viên",
        deptLabel: "Chọn Khoa trực thuộc",
        nameKoPlaceholder: "Họ tên tiếng Hàn",
        nameEnPlaceholder: "Họ tên tiếng Anh",
        emailPlaceholder: "Email trường chính thức",
        officePlaceholder: "Phòng làm việc",
        researchPlaceholder: "Lĩnh vực nghiên cứu",
        saveBtn: "Lưu vào Cơ sở dữ liệu",
        cancelBtn: "Đóng (ESC)",
        privacyTitle: "Yêu Cầu Cập Nhật & Xóa Thông Tin",
        optUpdate: "Yêu cầu cập nhật thông tin",
        optRemove: "Yêu cầu ẩn hoặc xóa",
        optAdd: "Yêu cầu thêm giảng viên",
        roleProf: "Giảng viên",
        roleStudent: "Sinh viên",
        roleStaff: "Nhân viên khoa",
        detailsPlaceholder: "Vui lòng nhập chi tiết thông tin email, phòng làm việc cần chỉnh sửa hoặc lý do xóa.",
        submitReqBtn: "Gửi yêu cầu",
        savedMsg: "Đã lưu thông tin giảng viên vào cơ sở dữ liệu.",
        reqSavedMsg: "Đã tiếp nhận yêu cầu cập nhật thông tin.",
      };
    }
    return {
      adminTitle: "Register Verified Faculty Member",
        adminKeyPlaceholder: "Administrator key",
      deptLabel: "Select Department",
      nameKoPlaceholder: "Korean Name",
      nameEnPlaceholder: "English Full Name",
      emailPlaceholder: "Official University Email",
      officePlaceholder: "Office Building & Room",
      researchPlaceholder: "Research Specialties",
      saveBtn: "Save to Database",
      cancelBtn: "Cancel (ESC)",
      privacyTitle: "Faculty Information Update & Opt-Out Request",
      optUpdate: "Request Information Update",
      optRemove: "Request Directory Removal",
      optAdd: "Request New Faculty Addition",
      roleProf: "Faculty Member",
      roleStudent: "University Student",
      roleStaff: "Department Staff",
      detailsPlaceholder: "Please describe the email, office number update, or removal reason.",
      submitReqBtn: "Submit Request",
      savedMsg: "Verified faculty record saved to database.",
      reqSavedMsg: "Your update request has been logged.",
    };
  }
}

interface IModalsProps {
  uiLanguage: SupportedLanguage;
  departments: IDepartment[];
  selectedProfessor: IProfessor | null;
  isAdminOpen: boolean;
  isPrivacyOpen: boolean;
  onCloseAdmin: () => void;
  onClosePrivacy: () => void;
  onSuccessRefresh: (msg: string) => void;
  onErrorToast: (msg: string) => void;
}

/**
 * @component PrivacyAndAdminModals
 * @description Accessible, mobile-keyboard-safe modal dialogs with Escape & Backdrop close.
 */
export const PrivacyAndAdminModals: React.FC<IModalsProps> = ({
  uiLanguage,
  departments,
  selectedProfessor,
  isAdminOpen,
  isPrivacyOpen,
  onCloseAdmin,
  onClosePrivacy,
  onSuccessRefresh,
  onErrorToast,
}) => {
  const [deptId, setDeptId] = useState<number>(departments[0]?.id || 1);
  const [nameKo, setNameKo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [office, setOffice] = useState("W2");
  const [research, setResearch] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [requestType, setRequestType] = useState<"update" | "remove" | "add_new">("update");
  const [requesterRole, setRequesterRole] = useState<"professor" | "student" | "staff">("student");
  const [details, setDetails] = useState("");

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const detailsRef = useRef<HTMLTextAreaElement | null>(null);

  const apiService = useMemo(() => new ModalApiService(uiLanguage), [uiLanguage]);
  const localizer = useMemo(() => new CatalogLocalizer(uiLanguage), [uiLanguage]);
  const L = apiService.getLabels();
  const isAnyOpen = isAdminOpen || isPrivacyOpen;

  // Keyboard Escape handler, auto-focus, and body scroll lock
  useEffect(() => {
    if (!isAnyOpen) return;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;

    if (isAdminOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 60);
    } else if (isPrivacyOpen) {
      setTimeout(() => detailsRef.current?.focus(), 60);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAdmin();
        onClosePrivacy();
        return;
      }
      // Focus trap: keep Tab / Shift+Tab inside the open dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isAnyOpen, isAdminOpen, isPrivacyOpen, onCloseAdmin, onClosePrivacy]);

  if (!isAnyOpen) return null;

  const handleAddProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await apiService.submitNewProfessor({
        department_id: deptId, name_ko: nameKo, name_en: nameEn, email,
        office_location: office, research_fields: research, preferred_language: "both",
        source_url: "https://www.wsu.ac.kr",
      }, adminKey);
      if (!result.ok) onErrorToast(result.error || "Error");
      else {
        setNameKo(""); setNameEn(""); setEmail(""); setResearch(""); setAdminKey("");
        onCloseAdmin(); onSuccessRefresh(L.savedMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await apiService.submitPrivacyRequest({
        professorId: selectedProfessor?.id ?? null, requestType, requesterRole, details,
      });
      if (!result.ok) onErrorToast(result.error || "Error");
      else {
        setDetails(""); onClosePrivacy(); onSuccessRefresh(L.reqSavedMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => { onCloseAdmin(); onClosePrivacy(); }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-2 backdrop-blur-[1px] sm:items-center sm:p-4"
    >
      {isAdminOpen && (
        <div
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-[4px] border border-slate-300 border-t-4 border-t-[#357A16] bg-white p-5 shadow-2xl sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 id="modal-title" className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
              <UserPlus className="h-5 w-5 text-[#357A16]" />{L.adminTitle}
            </h3>
            <button type="button" aria-label={L.cancelBtn} onClick={onCloseAdmin} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleAddProfessor} className="space-y-3.5 text-base sm:text-sm">
            <div>
              <label htmlFor="dept-select" className="mb-1 block text-sm font-bold text-slate-700">{L.deptLabel}</label>
              <select id="dept-select" value={deptId} onChange={(e) => setDeptId(Number(e.target.value))} className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm">
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{localizer.getDepartmentName(d)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input ref={firstInputRef} required enterKeyHint="next" placeholder={L.nameKoPlaceholder} aria-label={L.nameKoPlaceholder} value={nameKo} onChange={(e) => setNameKo(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
              <input required enterKeyHint="next" placeholder={L.nameEnPlaceholder} aria-label={L.nameEnPlaceholder} value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
            </div>
            <input required type="email" inputMode="email" enterKeyHint="next" placeholder={L.emailPlaceholder} aria-label={L.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
            <input enterKeyHint="next" placeholder={L.officePlaceholder} aria-label={L.officePlaceholder} value={office} onChange={(e) => setOffice(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
            <input required enterKeyHint="done" placeholder={L.researchPlaceholder} aria-label={L.researchPlaceholder} value={research} onChange={(e) => setResearch(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
            <input required type="password" autoComplete="off" enterKeyHint="done" placeholder={L.adminKeyPlaceholder} aria-label={L.adminKeyPlaceholder} value={adminKey} onChange={(e) => setAdminKey(e.target.value)} className="w-full rounded-[3px] border border-slate-300 px-3 py-2.5 text-base sm:text-sm" />
            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={onCloseAdmin} className="w-1/3 rounded-[3px] border border-slate-300 bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">{L.cancelBtn}</button>
              <button type="submit" disabled={isSubmitting} className="w-2/3 rounded-[3px] bg-[#357A16] py-3 text-sm font-bold text-white hover:bg-[#2A6712] disabled:opacity-50">{L.saveBtn}</button>
            </div>
          </form>
        </div>
      )}

      {isPrivacyOpen && (
        <div
          ref={dialogRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-[4px] border border-slate-300 border-t-4 border-t-[#357A16] bg-white p-5 shadow-2xl sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 id="modal-title" className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg">
              <FileEdit className="h-5 w-5 text-[#357A16]" />{L.privacyTitle}
            </h3>
            <button type="button" aria-label={L.cancelBtn} onClick={onClosePrivacy} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handlePrivacySubmit} className="space-y-3.5 text-base sm:text-sm">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <select aria-label={L.privacyTitle} value={requestType} onChange={(e) => setRequestType(e.target.value as "update" | "remove" | "add_new")} className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm">
                <option value="update">{L.optUpdate}</option>
                <option value="remove">{L.optRemove}</option>
                <option value="add_new">{L.optAdd}</option>
              </select>
              <select aria-label={L.roleStudent} value={requesterRole} onChange={(e) => setRequesterRole(e.target.value as "professor" | "student" | "staff")} className="w-full rounded-[3px] border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm">
                <option value="professor">{L.roleProf}</option>
                <option value="student">{L.roleStudent}</option>
                <option value="staff">{L.roleStaff}</option>
              </select>
            </div>
            <textarea ref={detailsRef} required rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={L.detailsPlaceholder} aria-label={L.detailsPlaceholder} maxLength={1000} className="w-full rounded-[3px] border border-slate-300 p-3 text-base sm:text-sm" />
            <div className="flex gap-2.5 pt-2">
              <button type="button" onClick={onClosePrivacy} className="w-1/3 rounded-[3px] border border-slate-300 bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">{L.cancelBtn}</button>
              <button type="submit" disabled={isSubmitting} className="w-2/3 rounded-[3px] bg-[#357A16] py-3 text-sm font-bold text-white hover:bg-[#2A6712] disabled:opacity-50">{L.submitReqBtn}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
