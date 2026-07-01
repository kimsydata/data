import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-brand-50 px-4 text-center">
      <div>
        <div className="text-6xl" aria-hidden>
          🌵
        </div>
        <h1 className="mt-4 text-5xl font-bold text-brand-dark">404</h1>
        <p className="mt-3 text-gray-600">
          요청하신 페이지를 찾을 수 없습니다.
        </p>
        <Link to="/" className="btn-primary mt-8">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
