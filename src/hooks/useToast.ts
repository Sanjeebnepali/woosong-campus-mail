/**
 * @file src/hooks/useToast.ts
 * @description Custom React Hook and Object-Oriented Toast Notification Model
 * for non-blocking micro-interaction feedback (e.g., "Email Copied!", "Professor Added").
 */

"use client";

import { useState, useCallback } from "react";

/**
 * @class ToastNotification
 * @description OOP Value Class with constructor representing an active toast alert.
 */
export class ToastNotification {
  public readonly id: string;
  public readonly title: string;
  public readonly variant: "success" | "info" | "error";
  public readonly timestamp: number;

  /**
   * Constructor creates a uniquely identified toast instance.
   */
  constructor(title: string, variant: "success" | "info" | "error" = "success") {
    this.id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.title = title;
    this.variant = variant;
    this.timestamp = Date.now();
  }
}

/**
 * @function useToast
 * @description Custom React Hook that manages a queue of auto-dismissing toast alerts.
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  /**
   * Triggers a new toast notification and automatically removes it after 3.2 seconds.
   */
  const showToast = useCallback(
    (title: string, variant: "success" | "info" | "error" = "success") => {
      const notification = new ToastNotification(title, variant);
      setToasts((prev) => [...prev, notification]);

      // Automatically dismiss after 3200ms
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== notification.id));
      }, 3200);
    },
    []
  );

  /**
   * Manually dismisses a specific toast by ID.
   */
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
