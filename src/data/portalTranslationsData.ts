/**
 * @file src/data/portalTranslationsData.ts
 * @description Multilingual Translation Data Store Aggregator for Korean ('ko'),
 * English ('en'), Chinese ('zh'), and Vietnamese ('vi').
 * Strict compliance: < 300 lines, explicit imports, OOP constructor class, full comments.
 */

import { SupportedLanguage } from "@/types/directory.types";
import { IPortalTranslations } from "@/services/PortalTranslationService";
import { KoreanAndEnglishTranslationStore } from "@/data/portalTranslationsKoEn";
import { ChineseAndVietnameseTranslationStore } from "@/data/portalTranslationsZhVi";

/**
 * @class TranslationDataStore
 * @description OOP Data Repository with constructor combining the 4 pure single-language stores.
 */
export class TranslationDataStore {
  private readonly records: Record<SupportedLanguage, IPortalTranslations>;

  /** Constructor merges the Korean/English and Chinese/Vietnamese dictionaries. */
  constructor() {
    const koEn = new KoreanAndEnglishTranslationStore();
    const zhVi = new ChineseAndVietnameseTranslationStore();
    this.records = {
      ko: koEn.ko,
      en: koEn.en,
      zh: zhVi.zh,
      vi: zhVi.vi,
    };
  }

  public get(lang: SupportedLanguage): IPortalTranslations {
    return this.records[lang] || this.records.ko;
  }
}
