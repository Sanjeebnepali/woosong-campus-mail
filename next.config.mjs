/**
 * @file next.config.mjs
 * @description Next.js Production Configuration File.
 * Configures strict React mode and optimizes bundle settings for production.
 */

/** @type {import('next').NextConfig} */
// Content-Security-Policy. Next.js injects small inline scripts/styles, so 'unsafe-inline' is required
// unless a per-request nonce is added; everything else is locked to our own origin.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  // Allows building to a separate folder (used for testing a production build next to the dev server).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Enables React Strict Mode to highlight potential lifecycle issues during development
  reactStrictMode: true,
  // Do not advertise the framework in response headers.
  poweredByHeader: false,
  async headers() {
    // Dev server is left unframed so responsive testing tools keep working.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
