export type AuthUser = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const authService = {
  async signup(
    email: string,
    username: string,
    password: string
  ): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
  },
  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  async me(token: string): Promise<{ user: AuthUser }> {
    return request<{ user: AuthUser }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
