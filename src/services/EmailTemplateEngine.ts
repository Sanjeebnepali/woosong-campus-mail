/**
 * @file src/services/EmailTemplateEngine.ts
 * @description Production Object-Oriented Email Etiquette Constructor Engine.
 * Generates 100% pure single-language etiquette-compliant university emails in:
 * - Korean ('ko': 존댓말/격식체)
 * - English ('en': Polite Academic Standard)
 * - Chinese ('zh': 中文大学学术礼仪格式)
 * - Vietnamese ('vi': Chuẩn mực Email Học thuật Đại học)
 * Strict compliance: < 300 lines, explicit imports, OOP constructor class, full comments.
 */

import {
  EmailPurpose,
  EmailTone,
  GeneratedEmailDraft,
  IEmailFormInput,
  IProfessor,
  SupportedLanguage,
} from "@/types/directory.types";
import { CatalogLocalizer } from "@/services/CatalogLocalizationService";

/**
 * @class EmailTemplateEngine
 * @description Uses a class constructor pattern to bind the target professor and
 * student form inputs, then synthesizes subject lines, honorific greetings,
 * structured body paragraphs, and formal signatures in all 4 supported languages.
 */
export class EmailTemplateEngine {
  private readonly professor: IProfessor;
  private readonly input: IEmailFormInput;
  private readonly localizer: CatalogLocalizer;

  /** Constructor binds the selected professor record and student form fields. */
  constructor(professor: IProfessor, input: IEmailFormInput) {
    this.professor = professor;
    this.input = input;
    this.localizer = new CatalogLocalizer(input.language);
  }

  /** Primary builder method that produces a GeneratedEmailDraft instance in the active language. */
  public buildDraft(): GeneratedEmailDraft {
    const lang: SupportedLanguage = this.input.language;
    if (lang === "ko") return this.buildKoreanDraft();
    if (lang === "zh") return this.buildChineseDraft();
    if (lang === "vi") return this.buildVietnameseDraft();
    return this.buildEnglishDraft();
  }

  /** 1. Pure Korean Academic Email Draft (100% Korean) */
  private buildKoreanDraft(): GeneratedEmailDraft {
    const profDisplay = this.localizer.getProfessorDisplayName(this.professor);
    const researchKo = this.localizer.getResearchFields(this.professor);
    const studentName = this.input.studentName.trim() || "[성명]";
    const studentId = this.input.studentId.trim() || "[학번]";
    const major = this.input.studentMajor.trim() || "[학과/학부]";
    const course = this.input.courseName.trim() || "과목명";
    const details = this.input.keyDetails.trim() || "수업 및 학습 내용 관련 자문 요청";
    const timeSlot = this.input.preferredTimeSlot.trim() || "교수님께서 편하신 일시";
    const isFormal: EmailTone = this.input.tone;

    const purposeLabelMap: Record<EmailPurpose, string> = {
      appointment: "면담 요청의 건",
      absence: "수업 결석 사유 및 양해 요청의 건",
      assignment: "과제 및 학습 내용 질문의 건",
      grade: "성적 및 과제 피드백 문의의 건",
      research_lab: "연구실 및 학부연구생 지원 문의의 건",
    };
    const subject = `[${course}] ${studentId} ${studentName} - ${purposeLabelMap[this.input.purpose]}`;
    const greeting = isFormal === "formal" ? `존경하는 ${profDisplay}님, 안녕하십니까.` : `${profDisplay}님, 안녕하십니까.`;
    const intro = `이번 학기 교수님의 '${course}' 강의를 수강하고 있는 ${major} ${studentId} ${studentName}입니다. 바쁘신 연구와 강의 일정 중에 메일을 드리게 되어 송구합니다.`;

    const bodyMap: Record<EmailPurpose, string> = {
      appointment: `다름이 아니오라, '${course}' 수업 및 학습 내용(${details})과 관련하여 교수님의 고견과 지도를 구하고자 면담을 신청드리고자 합니다.\n\n혹시 다가오는 일정 중 연구실로 찾아뵐 수 있는 편하신 시간대가 있으신지 여쭙고 싶습니다. 제가 참석 가능한 시간대는 [${timeSlot}]입니다.`,
      absence: `다름이 아니오라, 다가오는 [${timeSlot}] 수업에 부득이하게 [${details}] 사유로 인하여 출석이 어려울 것 같아 사전에 양해의 말씀을 올립니다.\n\n관련 증빙 서류는 확인 즉시 제출하겠으며, 당일 강의 내용과 과제는 학우들을 통해 빠짐없이 보충하겠습니다.`,
      assignment: `다름이 아니오라, 공지해 주신 과제 및 학습 과정 중 [${details}] 부분에 대해 조언을 구하고자 메일을 올립니다.\n\n제가 이해한 방향대로 진행해도 괜찮을지 시간 나실 때 간략히 일러주시면 큰 도움이 되겠습니다.`,
      grade: `다름이 아니오라, 한 학기 동안 열정적인 강의로 지도해 주셔서 진심으로 감사드립니다. 이번 평가 결과와 관련하여 [${details}] 부분에서 제가 보완해야 할 점이 무엇인지 확인하여 향후 학습의 발전 기회로 삼고자 조심스럽게 여쭙습니다.`,
      research_lab: `평소 교수님의 주요 연구 분야(${researchKo})에 깊은 관심을 가져왔으며, [${details}] 관련 역량을 키우며 교수님 연구실에서 학부연구생으로 참여할 수 있는 기회가 있는지 여쭙고자 메일을 올립니다. 편하신 일시(${timeSlot})에 짧은 면담을 허락해 주시면 감사하겠습니다.`,
    };

    const closing = isFormal === "formal"
      ? `환절기 건강 유의하시기 바라며, 항상 유익한 가르침을 주셔서 진심으로 감사드립니다.`
      : `항상 좋은 강의와 지도에 감사드리며, 건강 유의하시기 바랍니다.`;
    const signature = `${major} ${studentId}\n${studentName} 올림`;

    return new GeneratedEmailDraft({
      subject,
      body: `${greeting}\n\n${intro}\n\n${bodyMap[this.input.purpose]}\n\n${closing}\n\n${signature}`,
      etiquetteChecklist: [
        "표준 말머리 제목 양식 적용 완료",
        "존칭 인사말 및 소속·학번·성함 자기소개 포함",
        "교수님 일정 배려 및 정중한 맺음말 서명 완료",
      ],
    });
  }

  /** 2. Pure English Academic Email Draft (100% English) */
  private buildEnglishDraft(): GeneratedEmailDraft {
    const profDisplay = this.localizer.getProfessorDisplayName(this.professor);
    const researchEn = this.localizer.getResearchFields(this.professor);
    const studentName = this.input.studentName.trim() || "[Your Name]";
    const studentId = this.input.studentId.trim() || "[Student ID]";
    const major = this.input.studentMajor.trim() || "[Your Department]";
    const course = this.input.courseName.trim() || "Course Name";
    const details = this.input.keyDetails.trim() || "our team project design and academic guidance";
    const timeSlot = this.input.preferredTimeSlot.trim() || "a time that is convenient for you, Professor";

    const purposeSubjectMap: Record<EmailPurpose, string> = {
      appointment: "Office Hours / Meeting Request",
      absence: "Absence Notice & Documentation",
      assignment: "Question Regarding Course Assignment",
      grade: "Request for Feedback on Course Assessment",
      research_lab: "Undergraduate Research Inquiry",
    };

    const subject = `[${course}] ${purposeSubjectMap[this.input.purpose]} - ${studentName} (${studentId})`;
    const greeting = `Dear ${profDisplay},`;
    const intro = `I hope this email finds you well.\nMy name is ${studentName} (Student ID: ${studentId}), a student in ${major}, currently enrolled in your ${course} class.`;

    const bodyMap: Record<EmailPurpose, string> = {
      appointment: `I am writing to respectfully request a brief meeting during your office hours to discuss ${details}.\n\nIf your schedule permits, I am available during the following time window: ${timeSlot}. Please let me know if another time works better for you.`,
      absence: `I am writing to inform you in advance that I will be unable to attend class on ${timeSlot} due to ${details}.\n\nI will submit the official supporting documentation promptly and review all lecture materials to stay on track.`,
      assignment: `While working on the upcoming course assignment, I encountered a question regarding ${details}.\n\nCould you kindly clarify whether my approach aligns with your guidelines?`,
      grade: `Thank you very much for an insightful semester in ${course}. I am writing to respectfully ask for brief feedback regarding ${details} so that I can improve in my future studies.`,
      research_lab: `I have followed your research in ${researchEn} with great interest. I am writing to inquire about potential opportunities to contribute to your research lab (${details}) and would be honored to meet briefly at your convenience (${timeSlot}).`,
    };

    const closing = `Thank you very much for your time, consideration, and guidance.\n\nSincerely,\n${studentName}\nStudent ID: ${studentId}\n${major}`;

    return new GeneratedEmailDraft({
      subject,
      body: `${greeting}\n\n${intro}\n\n${bodyMap[this.input.purpose]}\n\n${closing}`,
      etiquetteChecklist: [
        "Standard academic subject format applied",
        "Polite salutation and clear student identification",
        "Respectful call-to-action and formal academic sign-off",
      ],
    });
  }

  /** 3. Pure Chinese Academic Email Draft (100% Chinese) */
  private buildChineseDraft(): GeneratedEmailDraft {
    const profDisplay = this.localizer.getProfessorDisplayName(this.professor);
    const researchZh = this.localizer.getResearchFields(this.professor);
    const studentName = this.input.studentName.trim() || "[姓名]";
    const studentId = this.input.studentId.trim() || "[学号]";
    const major = this.input.studentMajor.trim() || "[所属院系]";
    const course = this.input.courseName.trim() || "课程名称";
    const details = this.input.keyDetails.trim() || "课程项目设计与学习指导咨询";
    const timeSlot = this.input.preferredTimeSlot.trim() || "老师方便的时间";

    const purposeMap: Record<EmailPurpose, string> = {
      appointment: "预约面谈请教",
      absence: "课程请假说明",
      assignment: "课程作业问题请教",
      grade: "课程成绩与考核反馈请教",
      research_lab: "本科生科研与实验室申请咨询",
    };

    const subject = `【${course}】${studentId} ${studentName} - ${purposeMap[this.input.purpose]}`;
    const greeting = `尊敬的 ${profDisplay}，您好！`;
    const intro = `我是修读您本学期《${course}》课程的${major}学生${studentName}（学号：${studentId}）。冒昧在您繁忙的教学与科研工作中致信，敬请谅解。`;

    const bodyMap: Record<EmailPurpose, string> = {
      appointment: `此次致信是希望能就《${course}》课程中的【${details}】相关问题向您当面请教。\n\n不知您近期是否有方便的面谈时间？我可前往您教研室的时间段为：【${timeSlot}】。若该时间段不便，我随时配合您的日程安排。`,
      absence: `因【${details}】原因，我在【${timeSlot}】无法按时出席《${course}》课堂，特此提前向您请假并致以歉意。\n\n相关证明材料我将及时提交，缺席期间的课程内容与作业我也会认真补齐，绝不落下课程进度。`,
      assignment: `在准备近期课程作业的过程中，我针对【${details}】部分遇到了疑问，特向您请教。\n\n恳请您在方便时给予简要指导，以便我更准确地完成作业要求。`,
      grade: `非常感谢您本学期在《${course}》课程中的悉心指导。关于本次考核结果，我希望了解自己在【${details}】方面的不足之处，以便在今后的学习中加以改进，恳请您赐教。`,
      research_lab: `我一直对您在【${researchZh}】领域的研究深感兴趣，希望咨询是否有机会围绕【${details}】参与您实验室的本科生科研学习。若您在【${timeSlot}】方便，恳请允许我简短拜访。`,
    };

    const closing = `衷心感谢您的悉心指导与宝贵时间，祝您工作顺利、身体健康！\n\n学生：${studentName}\n学号：${studentId}\n专业：${major} 敬上`;

    return new GeneratedEmailDraft({
      subject,
      body: `${greeting}\n\n${intro}\n\n${bodyMap[this.input.purpose]}\n\n${closing}`,
      etiquetteChecklist: [
        "符合大学学术邮件标准主题格式",
        "包含规范敬语问候与专业、学号、姓名自我介绍",
        "体谅教授日程并包含正式落款署名",
      ],
    });
  }

  /** 4. Pure Vietnamese Academic Email Draft (100% Vietnamese) */
  private buildVietnameseDraft(): GeneratedEmailDraft {
    const profDisplay = this.localizer.getProfessorDisplayName(this.professor);
    const researchVi = this.localizer.getResearchFields(this.professor);
    const studentName = this.input.studentName.trim() || "[Họ và tên]";
    const studentId = this.input.studentId.trim() || "[Mã số SV]";
    const major = this.input.studentMajor.trim() || "[Khoa/Ngành]";
    const course = this.input.courseName.trim() || "Tên môn học";
    const details = this.input.keyDetails.trim() || "xin tư vấn về thiết kế đồ án môn học";
    const timeSlot = this.input.preferredTimeSlot.trim() || "thời gian thuận tiện cho Thầy/Cô";

    const purposeMap: Record<EmailPurpose, string> = {
      appointment: "Xin lịch hẹn gặp trao đổi học tập",
      absence: "Đơn xin phép nghỉ học có lý do",
      assignment: "Câu hỏi về bài tập môn học",
      grade: "Xin phản hồi về kết quả đánh giá môn học",
      research_lab: "Xin tìm hiểu cơ hội nghiên cứu tại Phòng Lab",
    };

    const subject = `[${course}] ${purposeMap[this.input.purpose]} - ${studentName} (${studentId})`;
    const greeting = `Kính gửi ${profDisplay},`;
    const intro = `Em hy vọng Thầy/Cô đang có một tuần làm việc tốt lành.\nEm tên là ${studentName} (Mã số sinh viên: ${studentId}), sinh viên thuộc ${major}, hiện đang theo học lớp ${course} của Thầy/Cô trong học kỳ này.`;

    const bodyMap: Record<EmailPurpose, string> = {
      appointment: `Em viết thư này để kính xin Thầy/Cô một buổi hẹn ngắn tại văn phòng nhằm trao đổi và xin ý kiến hướng dẫn về: ${details}.\n\nNếu lịch làm việc của Thầy/Cô cho phép, em có thể đến gặp vào khung giờ: ${timeSlot}. Nếu thời gian trên chưa thuận tiện, em xin phép được sắp xếp theo lịch phù hợp nhất của Thầy/Cô ạ.`,
      absence: `Em viết thư này để xin phép Thầy/Cô cho em được vắng mặt trong buổi học ngày ${timeSlot} vì lý do: ${details}.\n\nEm xin cam kết sẽ nộp đầy đủ giấy tờ xác nhận hợp lệ và chủ động chép bài, hoàn thành mọi bài tập được giao để theo kịp tiến độ lớp học.`,
      assignment: `Trong quá trình thực hiện bài tập môn ${course}, em có một thắc mắc liên quan đến phần: ${details}.\n\nKính mong Thầy/Cô khi có thời gian có thể giải đáp ngắn gọn giúp em để em hoàn thành bài tập đúng yêu cầu ạ.`,
      grade: `Em xin chân thành cảm ơn những bài giảng tâm huyết của Thầy/Cô trong môn ${course}. Em viết thư này để kính xin Thầy/Cô phản hồi ngắn gọn về phần ${details} nhằm giúp em nhận biết những điểm còn thiếu sót và cải thiện tốt hơn trong các học kỳ tới.`,
      research_lab: `Em rất ngưỡng mộ các công trình nghiên cứu của Thầy/Cô trong lĩnh vực ${researchVi}. Em viết thư này để xin phép tìm hiểu cơ hội tham gia hỗ trợ nghiên cứu tại phòng Lab (${details}) và kính mong được gặp Thầy/Cô vào khoảng ${timeSlot}.`,
    };

    const closing = `Em xin chân thành cảm ơn thời gian và sự chỉ dẫn quý báu của Thầy/Cô.\n\nKính thư,\n${studentName}\nMã số sinh viên: ${studentId}\n${major}`;

    return new GeneratedEmailDraft({
      subject,
      body: `${greeting}\n\n${intro}\n\n${bodyMap[this.input.purpose]}\n\n${closing}`,
      etiquetteChecklist: [
        "Tiêu đề email đúng chuẩn mực học thuật đại học",
        "Lời chào kính ngữ và giới thiệu rõ họ tên, mã số sinh viên",
        "Nội dung lịch sự, tôn trọng thời gian của Giáo sư",
      ],
    });
  }
}
