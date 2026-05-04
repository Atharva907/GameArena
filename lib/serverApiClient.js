import { cookies } from "next/headers";
import { apiUrl } from "@/lib/apiClient";

export async function serverApiFetch(path, options = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return fetch(apiUrl(path), {
    cache: "no-store",
    ...options,
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(options.headers || {}),
    },
  });
}
