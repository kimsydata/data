import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../components/ProtectedRoute";
import { ErrorBox } from "../../components/Feedback";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/admin";

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      await api.adminLogin(username, password);
      await refresh();
      navigate(from, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="text-center">
          <span className="text-3xl" aria-hidden>🌱</span>
          <h1 className="mt-2 text-2xl">관리자 로그인</h1>
          <p className="mt-1 text-sm text-gray-500">그린테크 관리 시스템</p>
        </div>

        <div className="mt-8 space-y-4">
          {error && <ErrorBox message={error} />}
          <div>
            <label htmlFor="username" className="label">아이디</label>
            <input
              id="username"
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">비밀번호</label>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <Link
            to="/"
            className="block text-center text-sm text-gray-400 hover:text-brand"
          >
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
