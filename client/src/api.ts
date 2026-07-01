// API 호출 헬퍼 — Vite 프록시 덕분에 상대경로(/api) 사용, 세션 쿠키 포함

export interface Product {
  id: number;
  name: string;
  price: number;
  summary: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  userId: number | null;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  price: number;
  summary?: string;
  description?: string;
  imageUrl?: string;
}

export interface PostInput {
  title: string;
  content: string;
}

export interface Me {
  authenticated: boolean;
  uid?: number;
  role?: "user" | "admin";
  username?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  userId: number | null;
  postId: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
  active: boolean;
  createdAt: string;
  postCount: number;
}

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && (data as { error?: string }).error) ||
      "요청을 처리하지 못했습니다.";
    throw new Error(message);
  }
  return data as T;
}

// 제품
export const api = {
  getProducts: () => request<Product[]>("/products"),
  getProduct: (id: number) => request<Product>(`/products/${id}`),
  createProduct: (body: ProductInput) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: number, body: ProductInput) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  // 게시판
  getPosts: () => request<Post[]>("/posts"),
  getPost: (id: number) => request<Post>(`/posts/${id}`),
  createPost: (body: PostInput) =>
    request<Post>("/posts", { method: "POST", body: JSON.stringify(body) }),
  updatePost: (id: number, body: PostInput) =>
    request<Post>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePost: (id: number) =>
    request<void>(`/posts/${id}`, { method: "DELETE" }),

  // 댓글
  getComments: (postId: number) =>
    request<Comment[]>(`/posts/${postId}/comments`),
  createComment: (postId: number, content: string) =>
    request<Comment>(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
  updateComment: (id: number, content: string) =>
    request<Comment>(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  deleteComment: (id: number) =>
    request<void>(`/comments/${id}`, { method: "DELETE" }),

  // 관리자 — 회원 관리
  adminGetUsers: () => request<AdminUser[]>("/admin/users"),
  adminSetUserActive: (id: number, active: boolean) =>
    request<{ id: number; username: string; active: boolean }>(
      `/admin/users/${id}`,
      { method: "PATCH", body: JSON.stringify({ active }) }
    ),
  adminDeleteUser: (id: number) =>
    request<void>(`/admin/users/${id}`, { method: "DELETE" }),

  // 인증
  register: (username: string, password: string) =>
    request<{ role: "user"; username: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string) =>
    request<{ role: "user" | "admin"; username: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  adminLogin: (username: string, password: string) =>
    request<{ role: "admin"; username: string }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<Me>("/auth/me"),
  oauthStatus: () =>
    request<{ google: boolean; kakao: boolean }>("/auth/oauth/status"),
};

export function formatPrice(price: number): string {
  return price.toLocaleString("ko-KR") + "원";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
