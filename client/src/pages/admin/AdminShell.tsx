import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../components/ProtectedRoute";

export default function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { username, refresh } = useAuth();

  async function handleLogout() {
    await api.logout().catch(() => {});
    await refresh();
    navigate("/admin/login", { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? "bg-brand text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white" aria-hidden>
              🌱
            </span>
            <span className="font-bold text-brand-dark">그린테크 관리자</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">
              {username} 님
            </span>
            <Link to="/" className="btn-ghost">사이트 보기</Link>
            <button className="btn-secondary" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="container-page flex flex-1 gap-6 py-8">
        <nav className="hidden w-48 shrink-0 space-y-1 sm:block">
          <NavLink to="/admin" end className={linkClass}>
            대시보드
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            제품 관리
          </NavLink>
          <NavLink to="/admin/posts" className={linkClass}>
            게시글 관리
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            회원 관리
          </NavLink>
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
