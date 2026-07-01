import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import AdminShell from "./AdminShell";

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    api.getProducts().then((p) => setProductCount(p.length)).catch(() => {});
    api.getPosts().then((p) => setPostCount(p.length)).catch(() => {});
    api.adminGetUsers().then((u) => setUserCount(u.length)).catch(() => {});
  }, []);

  const cards = [
    { label: "등록 제품", value: productCount, to: "/admin/products", cta: "제품 관리하기" },
    { label: "게시판 글", value: postCount, to: "/admin/posts", cta: "게시글 관리하기" },
    { label: "가입 회원", value: userCount, to: "/admin/users", cta: "회원 관리하기" },
  ];

  return (
    <AdminShell>
      <h1 className="text-2xl">대시보드</h1>
      <p className="mt-2 text-sm text-gray-500">
        그린테크 사이트 현황을 한눈에 확인하세요.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="mt-2 text-3xl font-bold text-brand-dark">
              {c.value ?? "—"}개
            </div>
            <Link
              to={c.to}
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              {c.cta} →
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
