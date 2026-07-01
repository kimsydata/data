import { useEffect, useState } from "react";
import { api } from "../api";

// 카카오/구글 소셜 로그인 버튼.
// 항상 표시하되, 서버에 키가 설정되지 않은 제공자는 클릭 시 안내 메시지를 보여준다.
export default function SocialLogin() {
  const [status, setStatus] = useState<{ google: boolean; kakao: boolean }>({
    google: false,
    kakao: false,
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.oauthStatus().then(setStatus).catch(() => {});
  }, []);

  const go = (provider: "google" | "kakao", configured: boolean) => {
    if (!configured) {
      setNotice(
        `${provider === "kakao" ? "카카오" : "구글"} 로그인은 아직 설정되지 않았습니다. ` +
          `server/.env에 ${provider === "kakao" ? "KAKAO_CLIENT_ID" : "GOOGLE_CLIENT_ID"} 등을 등록한 뒤 서버를 재시작하세요.`
      );
      return;
    }
    // 소셜 로그인은 전체 페이지 리디렉트(팝업/iframe 불가)
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <div className="mt-2">
      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        간편 로그인
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="space-y-2">
        {/* 카카오 */}
        <button
          type="button"
          onClick={() => go("kakao", status.kakao)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-[#191600] transition hover:brightness-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 256 256" aria-hidden>
            <path
              fill="#191600"
              d="M128 36C70.56 36 24 72.89 24 118.4c0 29.46 19.5 55.3 48.84 69.78-1.61 5.6-10.36 35.77-10.71 38.15 0 0-.21 1.79.95 2.47.96.57 2.09.13 2.09.13 3.32-.46 38.46-25.14 44.54-29.42 5.94.83 12.05 1.26 18.29 1.26 57.44 0 104-36.89 104-82.37C232 72.89 185.44 36 128 36z"
            />
          </svg>
          카카오 로그인
        </button>

        {/* 구글 */}
        <button
          type="button"
          onClick={() => go("google", status.google)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Google로 로그인
        </button>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {notice}
        </p>
      )}
    </div>
  );
}
