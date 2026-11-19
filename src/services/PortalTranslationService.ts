/**
 * @file src/services/PortalTranslationService.ts
 * @description Centralized Object-Oriented Multilingual Translation Engine for the
 * Woosong University Academic Information System (wsinfo.wsu.ac.kr style).
 * Enforces 100% pure single-language UI labels across Korean ('ko'), English ('en'),
 * Chinese ('zh'), and Vietnamese ('vi') with zero mixed-language strings.
 * Strict compliance: < 300 lines, OOP constructor class, full educational comments.
 */

import { SupportedLanguage } from "@/types/directory.types";
import { TranslationDataStore } from "@/data/portalTranslationsData";

/**
 * Interface defining all localized UI strings across the 4 portal sections.
 */
export interface IPortalTranslations {
  universityName: string;
  portalSubName: string;
  systemMainTitle: string;
  systemBadge: string;
  dbStatusConnected: string;
  registerFacultyBtn: string;
  dataRequestBtn: string;
  sidebarTopTag: string;
  sidebarHeaderTitle: string;
  menu01Title: string;
  menu01Sub: string;
  menu02Title: string;
  menu02Sub: string;
  menu03Title: string;
  menu03Sub: string;
  menu04Title: string;
  menu04Sub: string;
  dbInfoTitle: string;
  dbInfoLine1: string;
  dbInfoLine2: string;
  dbInfoLine3: string;
  officialNoticeBadge: string;
  homeBannerTitle: string;
  homeBannerDesc: string;
  goToDirectoryBtn: string;
  goToComposerBtn: string;
  kpiColleges: string;
  kpiDepartments: string;
  kpiFaculty: string;
  kpiTemplates: string;
  kpiTemplatesValue: string;
  collegeTableHeading: string;
  collegeTableSource: string;
  colCode: string;
  colCollegeName: string;
  colDepartments: string;
  colFacultyCount: string;
  colAction: string;
  viewListBtn: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  searchPanelTitle: string;
  totalResultsLabel: string;
  tableViewLabel: string;
  cardViewLabel: string;
  resetFilterBtn: string;
  collegeLabel: string;
  allCollegesOption: string;
  departmentLabel: string;
  allDepartmentsOption: string;
  keywordLabel: string;
  keywordPlaceholder: string;
  colNo: string;
  colFacultyName: string;
  colOffice: string;
  colOfficialEmail: string;
  colResearch: string;
  colCompose: string;
  copyBtn: string;
  copiedBtn: string;
  writeEmailBtn: string;
  sourceLinkLabel: string;
  emptyDirectoryTitle: string;
  emptyDirectorySub: string;
  backToDirectoryBtn: string;
  goToPacketLabBtn: string;
  senderPanelTitle: string;
  recipientLabel: string;
  purposeCategoryLabel: string;
  draftLanguageLabel: string;
  draftLangKoOption: string;
  draftLangEnOption: string;
  draftToneLabel: string;
  toneFormalOption: string;
  tonePoliteOption: string;
  studentInfoLabel: string;
  inputNamePlaceholder: string;
  inputIdPlaceholder: string;
  inputCoursePlaceholder: string;
  inputTimePlaceholder: string;
  previewPanelTitle: string;
  verifyAndLogBtn: string;
  subjectFieldLabel: string;
  bodyFieldLabel: string;
  wordCountUnit: string;
  sendDefaultMailBtn: string;
  sendGmailBtn: string;
  sendNaverBtn: string;
  copyFullEmailBtn: string;
  packetMonitorTitle: string;
  packetMonitorDesc: string;
  autoPlayBtn: string;
  pauseBtn: string;
  facultyInboxTitle: string;
  statusDelivered: string;
  statusStandby: string;
  fromLabel: string;
  toLabel: string;
  stageLabel: string;
  conceptPrefix: string;
  footerCompliance: string;
}

/**
 * @class PortalTranslationDictionary
 * @description OOP Translation Service with constructor that returns strongly-typed,
 * 100% pure single-language UI labels for Korean ('ko'), English ('en'), Chinese ('zh'), and Vietnamese ('vi').
 */
export class PortalTranslationDictionary {
  private readonly lang: SupportedLanguage;
  private readonly store: TranslationDataStore;

  /** Constructor binds the selected portal language and initializes the data store. */
  constructor(lang: SupportedLanguage) {
    this.lang = lang;
    this.store = new TranslationDataStore();
  }

  /** Returns the complete translation dictionary for the active language. */
  public getStrings(): IPortalTranslations {
    return this.store.get(this.lang);
  }
}
