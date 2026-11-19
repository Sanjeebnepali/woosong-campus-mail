/**
 * @file src/components/PacketFlowWalkthrough.tsx
 * @description Institutional DBMS SQL Transaction & Mail Reception Trace Monitor.
 * Full mobile responsiveness, multi-line wrapping subject line, and ArrowLeft/ArrowRight
 * keyboard navigation across the 5 packet stages.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor class, full comments.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Play, Pause, ChevronRight, ChevronLeft, Terminal, Inbox, CheckCircle2, ArrowRight } from "lucide-react";
import { IEmailFormInput, IProfessor, SupportedLanguage } from "@/types/directory.types";
import { PortalTranslationDictionary } from "@/services/PortalTranslationService";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

interface IPacketStage {
  stepNumber: number;
  shortTitle: string;
  packetRoute: string;
  protocolBadge: string;
  explanation: string;
  sqlOrPayloadCode: string;
  databaseConcept: string;
}

/**
 * @class PacketWalkthroughEngine
 * @description OOP Simulation Engine with constructor that dynamically builds
 * the 5-stage DBMS transaction trace in the active UI language ('ko' | 'en' | 'zh' | 'vi').
 */
export class PacketWalkthroughEngine {
  private readonly professor: IProfessor | null;
  private readonly formInput: IEmailFormInput;
  private readonly subject: string;
  private readonly body: string;
  private readonly lang: SupportedLanguage;

  /** Constructor binds the live professor, student input, generated draft, and UI language. */
  constructor(params: {
    professor: IProfessor | null;
    formInput: IEmailFormInput;
    subject: string;
    body: string;
    lang: SupportedLanguage;
  }) {
    this.professor = params.professor;
    this.formInput = params.formInput;
    this.subject = params.subject;
    this.body = params.body;
    this.lang = params.lang;
  }

  /** Generates the 5 interactive packet walkthrough stages strictly in the active language. */
  public getStages(): IPacketStage[] {
    const localizer = new CatalogLocalizer(this.lang);
    const profName = this.professor
      ? localizer.getProfessorDisplayName(this.professor)
      : "Madhusudan Singh";
    const profEmail = this.professor?.email || "professor@wsu.ac.kr";
    const deptId = this.professor?.department_id || 2;
    const studentName = this.formInput.studentName.trim() || "Student";
    const studentId = this.formInput.studentId.trim() || "-";
    const purpose = this.formInput.purpose;

    const sqlStep1 = `{\n  "department_id": ${deptId},\n  "is_verified": true\n}`;
    const sqlStep2 = `SELECT p.professor_id, p.email\nFROM professors p\nINNER JOIN departments d ON p.department_id = d.department_id\nINNER JOIN colleges c ON d.college_id = c.college_id\nWHERE p.department_id = ${deptId} AND p.is_verified = TRUE;`;
    const sqlStep3 = `INSERT INTO template_logs\n  (professor_id, purpose, language, tone, satisfaction_rating)\nVALUES\n  (${this.professor?.id || 5}, '${purpose}', '${this.formInput.language}', '${this.formInput.tone}', 5);`;
    const sqlStep4 = `mailto:${profEmail}\n  ?subject=${encodeURIComponent(this.subject)}\n  &body=${encodeURIComponent(this.body.slice(0, 75))}...`;
    const sqlStep5 = `${profEmail}\n${studentName} (${studentId}) <student@wsu.ac.kr>\n${this.subject}`;

    if (this.lang === "ko") {
      return [
        { stepNumber: 1, shortTitle: "1단계. 조회 요청", packetRoute: "학생 웹 브라우저 ➔ 애플리케이션 서버", protocolBadge: `학과번호=${deptId}`, explanation: "학생이 단과대학과 학과를 선택하면 브라우저가 서버로 공식 교원 목록 조회 요청을 전송합니다.", sqlOrPayloadCode: sqlStep1, databaseConcept: "클라이언트·서버 요청 및 기본키·외래키 탐색" },
        { stepNumber: 2, shortTitle: "2단계. 정규화 결합", packetRoute: "서버 ➔ 데이터베이스 (단과대학 ⋈ 학과 ⋈ 교원)", protocolBadge: "테이블 결합 질의", explanation: "제3정규형으로 분리된 단과대학, 학과, 교원 테이블을 외래키로 결합하여 공식 이메일을 조회합니다.", sqlOrPayloadCode: sqlStep2, databaseConcept: "제3정규형 설계 및 다중 테이블 내부 결합" },
        { stepNumber: 3, shortTitle: "3단계. 무결성 검증", packetRoute: "양식 작성기 ➔ 데이터베이스 제약조건 검증 및 기록", protocolBadge: "무결성 검사 및 삽입", explanation: "양식 생성 시 참조 무결성과 도메인 무결성 조건을 검증한 뒤 익명 통계 로그를 기록합니다.", sqlOrPayloadCode: sqlStep3, databaseConcept: "데이터 조작어 삽입 및 참조·도메인 무결성" },
        { stepNumber: 4, shortTitle: "4단계. 표준서식 변환", packetRoute: "양식 생성 엔진 ➔ 학생 메일 프로그램 호출", protocolBadge: "메일 앱 연동", explanation: "학술 표준 예절에 맞게 완성된 제목과 본문을 학생의 메일 프로그램으로 안전하게 전달합니다.", sqlOrPayloadCode: sqlStep4, databaseConcept: "응용 계층 연동 및 개인정보 비저장 설계" },
        { stepNumber: 5, shortTitle: "5단계. 교원 메일수신", packetRoute: `학생 메일 계정 (${studentName}) ➔ ${profName} 메일함`, protocolBadge: "전송 및 수신 완료", explanation: "학생의 실제 학교 이메일 계정으로부터 교수님의 수신 메일함에 표준 양식 메일이 정상 도착합니다.", sqlOrPayloadCode: sqlStep5, databaseConcept: "전체 데이터베이스 및 이메일 발송 흐름 완료" },
      ];
    }
    if (this.lang === "zh") {
      return [
        { stepNumber: 1, shortTitle: "第一步：查询请求", packetRoute: "学生浏览器 ➔ 应用服务器", protocolBadge: `专业编号=${deptId}`, explanation: "学生选择学院和专业后，浏览器向服务器发送查询认证教授列表的请求数据包。", sqlOrPayloadCode: sqlStep1, databaseConcept: "客户端请求与主键/外键索引查找" },
        { stepNumber: 2, shortTitle: "第二步：第三范式连接", packetRoute: "应用服务器 ➔ 数据库（学院 ⋈ 专业 ⋈ 教授）", protocolBadge: "多表内连接查询", explanation: "由于数据库遵循第三范式设计，系统通过外键连接学院、专业与教授表并返回官方邮箱。", sqlOrPayloadCode: sqlStep2, databaseConcept: "第三范式规范化与多表连接查询" },
        { stepNumber: 3, shortTitle: "第三步：约束校验与记录", packetRoute: "邮件表单 ➔ 数据库完整性校验与插入", protocolBadge: "约束验证与写入", explanation: "生成邮件时，数据库校验外键参照完整性与检查约束，并记录匿名统计日志。", sqlOrPayloadCode: sqlStep3, databaseConcept: "数据插入语句、参照完整性与检查约束" },
        { stepNumber: 4, shortTitle: "第四步：学术格式封装", packetRoute: "模板生成引擎 ➔ 学生邮件客户端", protocolBadge: "客户端协议调用", explanation: "模板引擎将符合大学礼仪规范的主题与正文编码并唤醒学生的邮件客户端。", sqlOrPayloadCode: sqlStep4, databaseConcept: "应用层集成与隐私保护设计" },
        { stepNumber: 5, shortTitle: "第五步：教授收件箱接收", packetRoute: `学生邮箱 (${studentName}) ➔ ${profName} 收件箱`, protocolBadge: "邮件成功送达", explanation: "格式规范的学术邮件从学生的真实邮箱成功送达收件教授的邮箱收件箱。", sqlOrPayloadCode: sqlStep5, databaseConcept: "端到端数据库与邮件通信全流程完成" },
      ];
    }
    if (this.lang === "vi") {
      return [
        { stepNumber: 1, shortTitle: "BƯỚC 01. Gửi yêu cầu", packetRoute: "Trình duyệt Sinh viên ➔ Máy chủ Ứng dụng", protocolBadge: `Mã khoa=${deptId}`, explanation: "Khi sinh viên chọn Trường và Khoa, trình duyệt gửi gói tin yêu cầu danh sách giảng viên đã xác thực.", sqlOrPayloadCode: sqlStep1, databaseConcept: "Yêu cầu Máy khách - Máy chủ & Tra cứu Khóa" },
        { stepNumber: 2, shortTitle: "BƯỚC 02. Kết nối 3NF", packetRoute: "Máy chủ ➔ Cơ sở dữ liệu (Trường ⋈ Khoa ⋈ Giảng viên)", protocolBadge: "Truy vấn kết nối bảng", explanation: "Do lược đồ đạt chuẩn 3NF, hệ quản trị CSDL kết nối 3 bảng qua Khóa ngoại để trả về email chính thức.", sqlOrPayloadCode: sqlStep2, databaseConcept: "Chuẩn hóa 3NF & Truy vấn kết nối đa bảng" },
        { stepNumber: 3, shortTitle: "BƯỚC 03. Kiểm tra & Ghi nhận", packetRoute: "Biểu mẫu Email ➔ Kiểm tra ràng buộc & Ghi nhật ký", protocolBadge: "Kiểm tra toàn vẹn", explanation: "Khi tạo biểu mẫu, CSDL kiểm tra toàn vẹn tham chiếu và miền giá trị trước khi ghi nhật ký ẩn danh.", sqlOrPayloadCode: sqlStep3, databaseConcept: "Câu lệnh INSERT, Khóa ngoại & Ràng buộc CHECK" },
        { stepNumber: 4, shortTitle: "BƯỚC 04. Đóng gói mẫu thư", packetRoute: "Bộ tạo mẫu ➔ Ứng dụng Mail của Sinh viên", protocolBadge: "Giao thức gửi thư", explanation: "Hệ thống định dạng tiêu đề, lời chào kính ngữ và nội dung rồi mở trực tiếp ứng dụng mail của sinh viên.", sqlOrPayloadCode: sqlStep4, databaseConcept: "Tích hợp tầng ứng dụng & Bảo mật quyền riêng tư" },
        { stepNumber: 5, shortTitle: "BƯỚC 05. Hộp thư Giáo sư", packetRoute: `Tài khoản Sinh viên (${studentName}) ➔ Hộp thư ${profName}`, protocolBadge: "Đã gửi thành công", explanation: "Email học thuật đúng chuẩn mực được gửi đến hộp thư của giáo sư từ địa chỉ email thật của sinh viên.", sqlOrPayloadCode: sqlStep5, databaseConcept: "Hoàn tất chu trình Cơ sở dữ liệu & Truyền thông" },
      ];
    }
    return [
      { stepNumber: 1, shortTitle: "STEP 01. HTTP Query", packetRoute: "Client Browser ➔ Application Server (HTTP GET)", protocolBadge: `GET /api/directory?dept_id=${deptId}`, explanation: "The student selects a College and Department in the inquiry panel. The client sends a structured query request to retrieve verified faculty records.", sqlOrPayloadCode: sqlStep1, databaseConcept: "Client-Server Request & Primary/Foreign Key Lookup" },
      { stepNumber: 2, shortTitle: "STEP 02. 3NF JOIN", packetRoute: "Application Server ➔ DBMS (colleges ⋈ departments ⋈ professors)", protocolBadge: "SQL SELECT + INNER JOIN", explanation: "Because the schema is normalized in 3NF/BCNF, the DBMS joins colleges, departments, and professors via Foreign Keys to return accurate faculty details.", sqlOrPayloadCode: sqlStep2, databaseConcept: "3NF/BCNF Normalization & Multi-Table INNER JOIN" },
      { stepNumber: 3, shortTitle: "STEP 03. CHECK & Log", packetRoute: "Email Form ➔ DBMS Integrity Verification & DML INSERT", protocolBadge: "SQL INSERT + CHECK Clause", explanation: "When the form is composed, the DBMS validates Referential Integrity (FOREIGN KEY) and Domain Integrity (CHECK clause) before logging anonymous usage statistics.", sqlOrPayloadCode: sqlStep3, databaseConcept: "DML INSERT, Referential Integrity & CHECK Constraint" },
      { stepNumber: 4, shortTitle: "STEP 04. Mailto URI", packetRoute: "EmailTemplateEngine ➔ Mail Client Protocol (mailto:)", protocolBadge: `mailto:${profEmail}`, explanation: "The OOP EmailTemplateEngine formats the academic header, honorific salutation, body, and sign-off, encoding the payload for the student's mail client.", sqlOrPayloadCode: sqlStep4, databaseConcept: "Application Layer Integration & Privacy-by-Design" },
      { stepNumber: 5, shortTitle: "STEP 05. Inbox Arrival", packetRoute: `Student Account (${studentName}) ➔ Faculty Inbox (${profEmail})`, protocolBadge: "SMTP 250 OK — Delivered", explanation: "The formatted academic email arrives in the recipient professor's inbox from the student's verified email account.", sqlOrPayloadCode: sqlStep5, databaseConcept: "End-to-End Database & Communication Lifecycle Complete" },
    ];
  }
}

interface IPacketFlowWalkthroughProps {
  uiLanguage: SupportedLanguage;
  selectedProfessor: IProfessor | null;
  formInput: IEmailFormInput;
  editableSubject: string;
  editableBody: string;
}

/**
 * @component PacketFlowWalkthrough
 * @description Renders an institutional DBMS Transaction Monitor with keyboard arrow navigation.
 */
export const PacketFlowWalkthrough: React.FC<IPacketFlowWalkthroughProps> = ({
  uiLanguage,
  selectedProfessor,
  formInput,
  editableSubject,
  editableBody,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const t = useMemo(() => new PortalTranslationDictionary(uiLanguage).getStrings(), [uiLanguage]);
  const localizer = useMemo(() => new CatalogLocalizer(uiLanguage), [uiLanguage]);
  const stages = useMemo(() => {
    const engine = new PacketWalkthroughEngine({
      professor: selectedProfessor,
      formInput,
      subject: editableSubject,
      body: editableBody,
      lang: uiLanguage,
    });
    return engine.getStages();
  }, [selectedProfessor, formInput, editableSubject, editableBody, uiLanguage]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % stages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isAutoPlaying, stages.length]);

  // Keyboard responsiveness: Left/Right arrow keys navigate steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveStepIndex((prev) => (prev + 1) % stages.length);
      } else if (e.key === "ArrowLeft") {
        setActiveStepIndex((prev) => (prev - 1 + stages.length) % stages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stages.length]);

  const currentStage = stages[activeStepIndex];
  const profDisplayName = selectedProfessor
    ? localizer.getProfessorDisplayName(selectedProfessor)
    : "Madhusudan Singh";
  const profEmail = selectedProfessor?.email || "professor@wsu.ac.kr";
  const studentName = formInput.studentName.trim() || "Student";

  return (
    <section className="rounded-[4px] border border-slate-300 border-t-2 border-t-[#357A16] bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">{t.packetMonitorTitle}</h3>
          <p className="mt-0.5 text-sm text-slate-600">{t.packetMonitorDesc}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-[3px] bg-[#357A16] px-4 py-2 text-sm font-bold text-white hover:bg-[#2A6712]"
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoPlaying ? t.pauseBtn : t.autoPlayBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveStepIndex((prev) => (prev - 1 + stages.length) % stages.length)}
            className="rounded-[3px] border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveStepIndex((prev) => (prev + 1) % stages.length)}
            className="rounded-[3px] border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-5">
          {stages.map((stage, idx) => {
            const isCurrent = idx === activeStepIndex;
            return (
              <button
                key={stage.stepNumber}
                type="button"
                onClick={() => {
                  setIsAutoPlaying(false);
                  setActiveStepIndex(idx);
                }}
                className={`flex flex-col items-start rounded-[3px] border p-3 text-left transition ${
                  isCurrent
                    ? "border-[#357A16] bg-[#357A16] text-white"
                    : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className="text-sm font-bold">{stage.shortTitle}</span>
                <span className={`mt-1 w-full break-all font-mono text-xs ${isCurrent ? "text-sky-200" : "text-slate-600"}`}>
                  {stage.protocolBadge}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-[4px] border border-slate-300 bg-slate-900 p-4 text-slate-100 sm:p-5 lg:col-span-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2.5">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-sky-300">
                  <Terminal className="h-4 w-4 shrink-0" />
                  <span className="break-words">{currentStage.packetRoute}</span>
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {t.stageLabel} 0{currentStage.stepNumber} / 05
                </span>
              </div>
              <p className="mb-3.5 text-sm leading-relaxed text-slate-200">
                {currentStage.explanation}
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-[3px] border border-slate-700 bg-slate-950 p-3.5 font-mono text-sm leading-relaxed text-sky-200">
                {currentStage.sqlOrPayloadCode}
              </pre>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-sm text-slate-300">
              <span>{t.conceptPrefix} {currentStage.databaseConcept}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </div>
          </div>

          <div className="rounded-[4px] border border-slate-300 bg-slate-50 p-4 sm:p-5 lg:col-span-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <Inbox className="h-4 w-4 shrink-0 text-[#357A16]" />
                <span className="break-all">{t.facultyInboxTitle} ({profEmail})</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-[3px] border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-[#357A16]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {activeStepIndex === 4 ? t.statusDelivered : t.statusStandby}
              </span>
            </div>

            <div className="rounded-[3px] border border-slate-300 bg-white p-4">
              <div className="mb-3 space-y-2 border-b border-slate-200 pb-3 text-sm">
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="font-bold text-slate-600">{t.fromLabel}:</span>
                  <span className="break-all font-mono font-semibold text-slate-900">
                    {studentName} &lt;student@wsu.ac.kr&gt;
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-1">
                  <span className="font-bold text-slate-600">{t.toLabel}:</span>
                  <span className="break-all font-mono font-semibold text-[#357A16]">
                    {profDisplayName} &lt;{profEmail}&gt;
                  </span>
                </div>
                {/* Full Wrapping Subject Box (Never clipped!) */}
                <div className="rounded-[3px] bg-slate-50 p-2.5 pt-1.5">
                  <span className="block text-xs font-bold text-slate-500">{t.subjectFieldLabel}:</span>
                  <span className="mt-0.5 block break-words text-base font-bold leading-snug text-slate-900">
                    {editableSubject}
                  </span>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-800">
                {editableBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
