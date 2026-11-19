/**
 * @file src/hooks/useEmailComposer.ts
 * @description Custom React Hook (`useEmailComposer`) that orchestrates the Academic Email
 * Composer. Synchronizes directly with the active portal language ('ko' | 'en' | 'zh' | 'vi')
 * so that switching languages immediately updates the email subject, body, and checklist.
 * Strict compliance: < 300 lines, explicit imports, React hooks, OOP constructor calls, full comments.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  GeneratedEmailDraft,
  IEmailFormInput,
  IProfessor,
  SupportedLanguage,
} from "@/types/directory.types";
import { EmailTemplateEngine } from "@/services/EmailTemplateEngine";
import { MailLauncherService } from "@/services/MailLauncherService";

/**
 * @function useEmailComposer
 * @description Manages student form state, live editable email subject/body,
 * AI refinement calls, and mail launcher URLs across all 4 supported languages.
 */
export function useEmailComposer(
  selectedProfessor: IProfessor | null,
  uiLanguage: SupportedLanguage
) {
  // 1. Student Mini-Form State
  const [formInput, setFormInput] = useState<IEmailFormInput>({
    studentName: "",
    studentId: "",
    studentMajor: "",
    courseName: "",
    purpose: "appointment",
    language: uiLanguage,
    tone: "formal",
    keyDetails: "",
    preferredTimeSlot: "",
    studentContact: "",
  });

  // 2. Live Editable Preview State
  const [editableSubject, setEditableSubject] = useState<string>("");
  const [editableBody, setEditableBody] = useState<string>("");
  const [etiquetteChecklist, setEtiquetteChecklist] = useState<string[]>([]);
  const [generatedBy, setGeneratedBy] = useState<
    "template-engine" | "ai-llm-hybrid"
  >("template-engine");
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // Immediately synchronize the email draft language whenever the user changes the top UI language
  useEffect(() => {
    setFormInput((prev) => ({
      ...prev,
      language: uiLanguage,
      studentMajor: "",
    }));
  }, [uiLanguage]);

  // 3. Real-time Deterministic Generation via OOP EmailTemplateEngine Constructor
  useEffect(() => {
    if (!selectedProfessor) return;
    const engine = new EmailTemplateEngine(selectedProfessor, formInput);
    const draft: GeneratedEmailDraft = engine.buildDraft();

    setEditableSubject(draft.subject);
    setEditableBody(draft.body);
    setEtiquetteChecklist(draft.etiquetteChecklist);
    setGeneratedBy(draft.generatedBy);
  }, [selectedProfessor, formInput]);

  /** Updates a specific field in the student mini-form. */
  const updateField = useCallback(
    <K extends keyof IEmailFormInput>(field: K, value: IEmailFormInput[K]) => {
      setFormInput((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  /** Calls the backend /api/generate-email endpoint to log anonymous metrics and polish draft. */
  const triggerAIRefinement = useCallback(async (): Promise<boolean> => {
    if (!selectedProfessor) return false;
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professor: selectedProfessor,
          formInput,
        }),
      });

      if (!response.ok) return false;
      const data = await response.json();
      if (data.draft) {
        setEditableSubject(data.draft.subject);
        setEditableBody(data.draft.body);
        setEtiquetteChecklist(data.draft.etiquetteChecklist || []);
        setGeneratedBy(data.draft.generatedBy || "template-engine");
        return true;
      }
      return false;
    } catch (error) {
      console.error("[useEmailComposer] AI Refinement error:", error);
      return false;
    } finally {
      setIsGeneratingAI(false);
    }
  }, [selectedProfessor, formInput]);

  // 4. Instantiate OOP MailLauncherService via its constructor
  const mailLauncher = useMemo(() => {
    const email = selectedProfessor?.email || "professor@wsu.ac.kr";
    return new MailLauncherService(email, editableSubject, editableBody);
  }, [selectedProfessor, editableSubject, editableBody]);

  // Compute live word count
  const wordCount = useMemo(() => {
    return editableBody
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }, [editableBody]);

  return {
    formInput,
    updateField,
    editableSubject,
    setEditableSubject,
    editableBody,
    setEditableBody,
    etiquetteChecklist,
    generatedBy,
    isGeneratingAI,
    triggerAIRefinement,
    mailLauncher,
    wordCount,
  };
}
