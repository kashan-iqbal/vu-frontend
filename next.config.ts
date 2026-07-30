import type { NextConfig } from "next";

/**
 * Security headers applied to every route. CSP is intentionally deferred to
 * avoid breaking the Google OAuth flow; the remaining headers are safe and
 * improve the Lighthouse "Best Practices" score. X-Frame-Options is SAMEORIGIN
 * (not DENY) so any same-origin auth framing keeps working.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Do not advertise the framework in the X-Powered-By header.
  poweredByHeader: false,
  // Gzip/Brotli-compatible response compression.
  compress: true,
  images: {
    // Serve modern formats where the browser supports them.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2xsxph8kpxj0f.cloudfront.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  // Consolidate www → non-www so both don't compete in search. Runs only if www
  // requests actually reach the Next app; harmless no-op if the host/CDN already
  // redirects. http → https is handled at the hosting/CDN layer.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vuexamprep.com" }],
        destination: "https://vuexamprep.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
