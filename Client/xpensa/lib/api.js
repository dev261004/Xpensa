const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api/v1";

export const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (token && options.auth !== false) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    body: isFormData || typeof options.body === "string" ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = data?.message || data || "Request failed";
    const error = new Error(message);
    error.data = data;
    throw error;
  }

  return data?.data ?? data;
}
