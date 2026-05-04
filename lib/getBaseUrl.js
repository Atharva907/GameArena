export function getBaseUrl(request) {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const host =
    request?.headers?.get("x-forwarded-host") ||
    request?.headers?.get("host");
  const protocol =
    request?.headers?.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (!host) {
    throw new Error("Unable to determine base URL for verification link");
  }

  return `${protocol}://${host}`;
}
