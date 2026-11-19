/**
 * @file src/app/layout.tsx
 * @description Root Application Layout for Woosong University Academic Information System.
 * Includes `translate="no"`, `className="notranslate"`, and `<meta name="google" content="notranslate" />`
 * so Google Chrome's built-in auto-translator never hijacks or overwrites our native
 * 4-language (Korean, English, Chinese, Vietnamese) portal UI into broken English!
 */

import React from "react";
import type { Metadata, Viewport } from "next";
// Self-hosted variable fonts (served from our own domain; no third-party requests)
import "@fontsource-variable/noto-sans-kr";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/noto-sans";
import "./globals.css";

/**
 * @class SiteMetadataConfig
 * @description OOP Configuration class with constructor that produces Next.js Metadata.
 */
class SiteMetadataConfig {
  public readonly title: string;
  public readonly description: string;

  /** Constructor initializes SEO title and description. */
  constructor() {
    this.title = "우송대학교 교원 연락처 통합조회 | WSINFO CampusMail";
    this.description =
      "Woosong University Official Faculty Directory & Standardized Academic Email Information System (KOR / ENG / CHN / VIE).";
  }

  public toNextMetadata(): Metadata {
    return {
      title: this.title,
      description: this.description,
      applicationName: "WSINFO CampusMail",
      openGraph: { title: this.title, description: this.description, siteName: "Woosong University", type: "website", locale: "ko_KR" },
      other: {
        google: "notranslate",
      },
    };
  }
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#151515" };

const seoConfig = new SiteMetadataConfig();
export const metadata: Metadata = seoConfig.toNextMetadata();

/**
 * @component RootLayout
 * @description Wraps the portal with Noto Sans multilingual university typography
 * and blocks browser auto-translate interference via `translate="no"` and `notranslate`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body translate="no" className={`notranslate min-h-screen bg-[#F7F9FA] text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
