import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Comment, formatDate } from "../api";
import { useAuth } from "./ProtectedRoute";
import { Spinner, ErrorBox } from "./Feedback";

export default function CommentSection({ postId }: { postId: number }) {
  const { authenticated, uid, role } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  async function load() {
    try {
      setComments(await api.getComments(postId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function handleAdd() {
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.createComment(postId, content);
      setContent("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("이 댓글을 삭제하시겠습니까?")) return;
    try {
      await api.deleteComment(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(c: Comment) {
    setEditingId(c.id);
    setEditText(c.content);
    setError("");
  }

  async function handleEditSave(id: number) {
    if (!editText.trim()) return;
    try {
      await api.updateComment(id, editText);
      setEditingId(null);
      setEditText("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const canDelete = (c: Comment) =>
    role === "admin" || (c.userId != null && c.userId === uid);

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-lg">댓글 {comments.length > 0 && `(${comments.length})`}</h2>

      {loading ? (
        <Spinner label="댓글 불러오는 중..." />
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.length === 0 && (
            <li className="text-sm text-gray-400">첫 댓글을 남겨보세요.</li>
          )}
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {c.author}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(c.createdAt)}
                </span>
              </div>

              {editingId === c.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="field min-h-20 resize-y"
                    value={editText}
                    maxLength={1000}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                      onClick={() => handleEditSave(c.id)}
                      disabled={!editText.trim()}
                    >
                      저장
                    </button>
                    <button
                      className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      onClick={() => setEditingId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                    {c.content}
                  </p>
                  {canDelete(c) && (
                    <div className="mt-2 flex gap-3">
                      <button
                        className="text-xs text-gray-500 hover:underline"
                        onClick={() => startEdit(c)}
                      >
                        수정
                      </button>
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => handleDelete(c.id)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {error && <div className="mt-4"><ErrorBox message={error} /></div>}

      <div className="mt-6">
        {authenticated ? (
          <div className="space-y-2">
            <textarea
              className="field min-h-24 resize-y"
              value={content}
              maxLength={1000}
              placeholder="댓글을 입력하세요 (최대 1000자)"
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={saving || !content.trim()}
              >
                {saving ? "등록 중..." : "댓글 등록"}
              </button>
            </div>
          </div>
        ) : (
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-gray-600">
            댓글을 작성하려면{" "}
            <Link
              to="/login"
              state={{ from: { pathname: `/board/${postId}` } }}
              className="font-semibold text-brand hover:underline"
            >
              로그인
            </Link>
            이 필요합니다.
          </p>
        )}
      </div>
    </section>
  );
}
