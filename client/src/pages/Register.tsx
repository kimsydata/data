import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../components/ProtectedRoute";
import { ErrorBox } from "../components/Feedback";
import SocialLogin from "../components/SocialLogin";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/board";

  async function handleRegister() {
    setError("");
    if (username.trim().length < 3 || username.trim().length > 20) {
      setError("아이디는 3~20자여야 합니다.");
      return;
    }
    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      await api.register(username.trim(), password);
      await refresh();
      navigate(from, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-sm p-8">
        <div className="text-center">
          <span className="text-3xl" aria-hidden>🌱</span>
          <h1 className="mt-2 text-2xl">회원가입</h1>
          <p className="mt-1 text-sm text-gray-500">
            가입하면 게시판에 글을 쓸 수 있어요
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {error && <ErrorBox message={error} />}
          <div>
            <label htmlFor="username" className="label">아이디 (3~20자)</label>
            <input
              id="username"
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">비밀번호 (4자 이상)</label>
            <input
              id="password"
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="label">비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              className="field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              autoComplete="new-password"
            />
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <SocialLogin />

          <p className="text-center text-sm text-gray-500">
            이미 회원이신가요?{" "}
            <Link
              to="/login"
              state={location.state}
              className="font-semibold text-brand hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
