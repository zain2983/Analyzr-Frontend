const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://analyzr-backend.onrender.com"

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` on styles is required by Tailwind's runtime style
 * injection and Radix's positioning, and `'unsafe-eval'` on scripts is
 * required by the Next.js dev server's HMR — it's dropped in production,
 * where it would otherwise hand a would-be XSS its execution primitive.
 *
 * `connect-src` is pinned to the configured backend so a script that does get
 * injected can't quietly ship the user's uploaded data to a third party.
 */
const csp = [
  "default-src 'self'",
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${backendUrl}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Omitted in development: the local backend is plain http://localhost, and
  // this directive shouldn't be relied on to special-case it.
  ...(process.env.NODE_ENV === "development" ? [] : ["upgrade-insecure-requests"]),
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Clickjacking: frame-ancestors above is the modern control; this covers
  // browsers that still honour only the legacy header.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Don't advertise the framework version to scanners.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
