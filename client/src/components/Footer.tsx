import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 bg-gray-50">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white"
              aria-hidden="true"
            >
              🌱
            </span>
            <span className="text-lg font-bold text-brand-dark">그린테크</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            지구를 생각하는 친환경 기술.
            <br />
            일상의 작은 선택이 큰 변화를 만듭니다.
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <h3 className="mb-3 text-gray-900">바로가기</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-brand">
                회사소개
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-brand">
                제품소개
              </Link>
            </li>
            <li>
              <Link to="/board" className="hover:text-brand">
                게시판
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-brand">
                관리자 로그인
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm text-gray-600">
          <h3 className="mb-3 text-gray-900">고객센터</h3>
          <address className="space-y-2 not-italic leading-relaxed">
            <div>서울특별시 마포구 친환경로 20, 그린빌딩 4층</div>
            <div>전화: 02-1234-5678</div>
            <div>이메일: hello@greentech.co.kr</div>
          </address>
        </div>
      </div>

      <div className="border-t border-gray-200 py-5 text-center text-xs text-gray-400">
        © 2026 그린테크. All rights reserved.
      </div>
    </footer>
  );
}
