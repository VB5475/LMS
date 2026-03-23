import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "../types";

const BASE_URL = "https://api.freeapi.app";
const TIMEOUT_MS = 10000;

async function wait(ms: number) {
 return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithTimeout(
 url: string,
 options: RequestInit,
 timeout = TIMEOUT_MS,
): Promise<Response> {
 const controller = new AbortController();
 const id = setTimeout(() => controller.abort(), timeout);
 try {
  const res = await fetch(url, { ...options, signal: controller.signal });
  return res;
 } finally {
  clearTimeout(id);
 }
}

async function apiCall<T>(
 endpoint: string,
 options: RequestInit = {},
 retries = 2,
): Promise<T> {
 const token = await SecureStore.getItemAsync("accessToken");

 const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(options.headers as Record<string, string>),
 };

 if (token) {
  headers["Authorization"] = `Bearer ${token}`;
 }

 let lastErr: Error = new Error("Unknown error");

 for (let attempt = 0; attempt <= retries; attempt++) {
  try {
   const res = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
   });

   if (res.status === 401 && attempt === 0) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
     headers["Authorization"] = `Bearer ${refreshed}`;
     continue;
    }
   }

   if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.message || `HTTP ${res.status}`);
   }

   const json = await res.json();
   return json as T;
  } catch (err: any) {
   lastErr = err;
   if (err.name === "AbortError") {
    throw new Error("Request timed out. Check your connection.");
   }
   if (attempt < retries) {
    await wait(1000 * (attempt + 1));
   }
  }
 }

 throw lastErr;
}

async function refreshAccessToken(): Promise<string | null> {
 try {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/api/v1/users/refresh-token`, {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const newToken = json?.data?.accessToken;
  if (newToken) {
   await SecureStore.setItemAsync("accessToken", newToken);
  }
  return newToken || null;
 } catch {
  return null;
 }
}

export const authApi = {
 login: (email: string, password: string) =>
  apiCall<ApiResponse<any>>("/api/v1/users/login", {
   method: "POST",
   body: JSON.stringify({ email, password }),
  }),

 register: (username: string, email: string, password: string) =>
  apiCall<ApiResponse<any>>("/api/v1/users/register", {
   method: "POST",
   body: JSON.stringify({ username, email, password }),
  }),

 getCurrentUser: () => apiCall<ApiResponse<any>>("/api/v1/users/current-user"),

 logout: () =>
  apiCall<ApiResponse<{}>>("/api/v1/users/logout", { method: "POST" }),
};

export const courseApi = {
 getCourses: (page = 1, limit = 10) =>
  apiCall<any>(`/api/v1/public/youtube/videos?page=${page}&limit=${limit}`),

 getCourseById: (videoId: string) =>
  apiCall<any>(`/api/v1/public/youtube/videos/${videoId}`),

 getInstructors: (page = 1, limit = 10) =>
  apiCall<any>(`/api/v1/public/randomusers?page=${page}&limit=${limit}`),
};

export default apiCall;
