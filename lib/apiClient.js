export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

export const apiUrl = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = (path, options = {}) => {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  return fetch(apiUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });
};

export const axiosWithCredentials = {
  withCredentials: true,
  timeout: 15000,
};
