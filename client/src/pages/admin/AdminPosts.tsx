import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Post, formatDate } from "../../api";
import AdminShell from "./AdminShell";
import { Spinner, ErrorBox, EmptyState } from "../../components/Feedback";

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setPosts(await api.getPosts());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`'${title}' 글을 삭제하시겠습니까?`)) return;
    try {
      await api.deletePost(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl">게시글 관리</h1>
      <p className="mt-2 text-sm text-gray-500">
        모든 게시글을 확인하고 삭제할 수 있습니다.
      </p>

      {error && <div className="mt-4"><ErrorBox message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="게시글이 없습니다." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">작성자</th>
                <th className="hidden px-4 py-3 sm:table-cell">작성일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/board/${p.id}`}
                      className="font-medium text-gray-800 hover:text-brand"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.author}</td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
