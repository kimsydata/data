import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, Post, formatDate } from "../api";
import { Spinner, ErrorBox, EmptyState } from "../components/Feedback";
import { useAuth } from "../components/ProtectedRoute";

export default function Board() {
  const { authenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    api
      .getPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function goLogin() {
    navigate("/login", { state: { from: { pathname: "/board/new" } } });
  }

  return (
    <div className="container-page py-16">
      <header className="mb-8 flex items-center justify-between">
        <h1>게시판</h1>
        {authenticated ? (
          <Link to="/board/new" className="btn-primary">
            글쓰기
          </Link>
        ) : (
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowLoginPrompt(true)}
          >
            글쓰기
          </button>
        )}
      </header>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && posts.length === 0 && (
        <EmptyState message="아직 작성된 글이 없습니다. 첫 글을 남겨보세요!" />
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="overflow-hidden rounded-xl ring-1 ring-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="hidden w-16 px-4 py-3 sm:table-cell">번호</th>
                <th className="px-4 py-3">제목</th>
                <th className="hidden w-28 px-4 py-3 sm:table-cell">작성자</th>
                <th className="w-28 px-4 py-3">날짜</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post, idx) => (
                <tr key={post.id} className="hover:bg-brand-50/40">
                  <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">
                    {posts.length - idx}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/board/${post.id}`}
                      className="font-medium text-gray-800 hover:text-brand"
                    >
                      {post.title}
                    </Link>
                    {!!post.commentCount && post.commentCount > 0 && (
                      <span className="ml-2 text-xs font-semibold text-brand">
                        [{post.commentCount}]
                      </span>
                    )}
                    <span className="ml-2 text-xs text-gray-400 sm:hidden">
                      {post.author}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 sm:table-cell">
                    {post.author}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {formatDate(post.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="card w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl" aria-hidden>🔒</div>
            <h2 id="login-prompt-title" className="mt-3 text-xl">
              로그인이 필요합니다
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              글을 작성하려면 먼저 로그인해 주세요. 회원이 아니라면 간단히
              가입할 수 있어요.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                className="btn-ghost"
                onClick={() => setShowLoginPrompt(false)}
              >
                닫기
              </button>
              <button className="btn-primary" onClick={goLogin}>
                로그인하러 가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
