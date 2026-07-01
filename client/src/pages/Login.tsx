import { useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../components/ProtectedRoute";
import { ErrorBox } from "../components/Feedback";
import SocialLogin from "../components/SocialLogin";

const OAUTH_ERRORS: Record<string, string> = {
  google_not_configured: "현재 구글 로그인이 설정되어 있지 않습니다.",
  kakao_not_configured: "현재 카카오 로그인이 설정되어 있지 않습니다.",
  oauth_unavailable: "현재 소셜 로그인을 사용할 수 없습니다.",
  oauth_state_mismatch: "소셜 로그인 검증에 실패했습니다. 다시 시도해 주세요.",
  oauth_expired: "소셜 로그인 시간이 만료되었습니다. 다시 시도해 주세요.",
  oauth_token_failed: "소셜 로그인에 실패했습니다. 다시 시도해 주세요.",
  oauth_profile_failed: "소셜 계정 정보를 가져오지 못했습니다. 다시 시도해 주세요.",
  oauth_failed: "소셜 로그인에 실패했습니다. 다시 시도해 주세요.",
  suspended: "정지된 계정입니다. 관리자에게 문의하세요.",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { refresh } = useAuth();

  const oauthError = searchParams.get("error");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    oauthError ? OAUTH_ERRORS[oauthError] || "로그인에 실패했습니다." : ""
  );
  const [loading, setLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/board";

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await api.login(username, password);
      await refresh();
      // 관리자 계정으로 로그인하면 관리자 대시보드로 이동
      navigate(res.role === "admin" ? "/admin" : from, { replace: true });
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
          <h1 className="mt-2 text-2xl">로그인</h1>
          <p className="mt-1 text-sm text-gray-500">
            그린테크 회원 로그인
          </p>
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

          <SocialLogin />

          <p className="text-center text-sm text-gray-500">
            아직 회원이 아니신가요?{" "}
            <Link
              to="/register"
              state={location.state}
              className="font-semibold text-brand hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
