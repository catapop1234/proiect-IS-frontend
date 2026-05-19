const API_BASE = "http://127.0.0.1:3099";

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  if (res.status === 200) {
    return res;
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

export const api = {
  // Auth
  signup: (data: { email: string; password: string; passwordConfirm: string; name: string }) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  signin: (data: { email: string; password: string }) =>
    request("/api/auth/signin", { method: "POST", body: JSON.stringify(data) }),
  me: () => request("/api/auth/me"),

  // Search
  search: (type: string, data: { city: string; radius?: number; page_token?: string }) =>
    request(`/api/search/${type}`, { method: "POST", body: JSON.stringify(data) }),
  placeDetails: (placeId: string) => request(`/api/place/${placeId}`),
  photo: (reference: string, maxWidth = 400) =>
    `${API_BASE}/api/photo?reference=${reference}&max_width=${maxWidth}`,

  // History
  getHistory: () => request("/api/history"),
  saveHistory: (data: { city: string; type: string; radius?: number }) =>
    request("/api/history", { method: "POST", body: JSON.stringify(data) }),
  clearHistory: () => request("/api/history", { method: "DELETE" }),

  // Favorites
  getFavorites: (type?: string) =>
    request(`/api/favorites${type ? `?type=${type}` : ""}`),
  addFavorite: (data: Record<string, unknown>) =>
    request("/api/favorites", { method: "POST", body: JSON.stringify(data) }),
  removeFavorite: (placeId: string) =>
    request(`/api/favorites/${placeId}`, { method: "DELETE" }),
  checkFavorites: (placeIds: string[]) =>
    request("/api/favorites/check", { method: "POST", body: JSON.stringify({ place_ids: placeIds }) }),
  favoriteStatus: (placeId: string) => request(`/api/favorites/status/${placeId}`),

  // Recommendations
  recommendations: () => request("/api/recommendations"),

  // Nearby
  nearby: (data: { lat: number; lng: number; current_type: string }) =>
    request("/api/nearby", { method: "POST", body: JSON.stringify(data) }),

  // User
  updateUser: (data: Record<string, string>) =>
    request("/api/user/update", { method: "POST", body: JSON.stringify(data) }),
};