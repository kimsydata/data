import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "./ProtectedRoute";

const links = [
  { to: "/", label: "홈", end: true },
  { to: "/about", label: "회사소개" },
  { to: "/products", label: "제품소개" },
  { to: "/board", label: "게시판" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { authenticated, role, username, loading, refresh } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-brand" : "text-gray-600 hover:text-brand"
    }`;

  async function handleLogout() {
    await api.logout().catch(() => {});
    await refresh();
    setOpen(false);
    navigate("/");
  }

  // 우측 인증 영역
  function AuthArea({ mobile = false }: { mobile?: boolean }) {
    if (loading) return null;

    if (!authenticated) {
      return (
        <Link
          to="/login"
          onClick={() => setOpen(false)}
          className={
            mobile
              ? "rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand"
              : "ml-2 rounded-md border border-brand px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50"
          }
        >
          로그인
        </Link>
      );
    }

    return (
      <div
        className={
          mobile
            ? "flex flex-col gap-1 border-t border-gray-100 pt-2"
            : "ml-2 flex items-center gap-2"
        }
      >
        {role === "admin" ? (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand"
          >
            관리자
          </Link>
        ) : (
          <span className="px-3 py-2 text-sm text-gray-500">
            {username}님
          </span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="그린테크 홈">
          <span
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white"
            aria-hidden="true"
          >
            🌱
          </span>
          <span className="text-lg font-bold text-brand-dark">그린테크</span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <AuthArea />
        </div>

        {/* 모바일 토글 */}
        <button
          className="btn-ghost md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <AuthArea mobile />
          </div>
        </div>
      )}
    </header>
  );
}
