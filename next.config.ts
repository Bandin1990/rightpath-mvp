import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const pagesBasePath = isGitHubPages && repositoryName ? `/${repositoryName}` : "";

const scriptSource =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "object-src 'none'",
      "img-src 'self' data:",
      "font-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      scriptSource,
      "connect-src 'self' https://*.supabase.co",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
};

if (isGitHubPages) {
  nextConfig.output = "export";
  nextConfig.basePath = pagesBasePath;
  nextConfig.assetPrefix = pagesBasePath;
  nextConfig.trailingSlash = true;
  nextConfig.images = { unoptimized: true };
} else {
  nextConfig.headers = async () => [{ source: "/(.*)", headers: securityHeaders }];
}

export default nextConfig;
