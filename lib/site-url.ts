const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return trimmed.replace(/\/+$/, "");
}

function withHttps(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function isLocalhostUrl(url: string): boolean {
  return LOCALHOST_PATTERN.test(normalizeUrl(url));
}

/**
 * Returns the public origin used for third-party callbacks.
 * On Vercel, prefer Vercel's deployment URL when NEXT_PUBLIC_SITE_URL is still
 * set to localhost, which prevents production PayOS links returning to local dev.
 */
export function getPublicSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  if (configuredUrl && (!process.env.VERCEL || !isLocalhostUrl(configuredUrl))) {
    return normalizeUrl(configuredUrl);
  }

  if (vercelUrl) {
    return normalizeUrl(withHttps(vercelUrl));
  }

  return "http://localhost:3000";
}
