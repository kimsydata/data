import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, Post, formatDate } from "../api";
import { Spinner, ErrorBox } from "../components/Feedback";
import { useAuth } from "../components/ProtectedRoute";
import CommentSection from "../components/CommentSection";

export default function BoardDetail() {
  const { uid, role } = useAuth();
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getPost(postId)
      .then((p) => {
        setPost(p);
        setTitle(p.title);
        setContent(p.content);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [postId]);

  // 본인 글이거나 관리자면 수정·삭제 가능
  const canModify =
    !!post && (role === "admin" || (post.userId != null && post.userId === uid));

  async function handleUpdate() {
    setFormError("");
    if (!title.trim() || !content.trim()) {
      setFormError("제목과 내용을 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updatePost(postId, { title, content });
      setPost(updated);
      setEditing(false);
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    try {
      await api.deletePost(postId);
      navigate("/board");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading) return <div className="container-page py-16"><Spinner /></div>;
  if (error)
    return (
      <div className="container-page py-16">
        <ErrorBox message={error} />
        <Link to="/board" className="btn-secondary mt-6">
          ← 목록으로
        </Link>
      </div>
    );
  if (!post) return null;

  return (
    <div className="container-page max-w-3xl py-16">
      <Link to="/board" className="text-sm text-gray-500 hover:text-brand">
        ← 목록으로
      </Link>

      {!editing ? (
        <>
          <article className="mt-4">
            <h1>{post.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 text-sm text-gray-500">
              <span>작성자: {post.author}</span>
              <span>작성일: {formatDate(post.createdAt)}</span>
              {post.updatedAt !== post.createdAt && (
                <span>(수정됨: {formatDate(post.updatedAt)})</span>
              )}
            </div>
            <hr className="my-6 border-gray-100" />
            <p className="whitespace-pre-line leading-relaxed text-gray-800">
              {post.content}
            </p>

            {canModify && (
              <div className="mt-10 flex gap-3">
                <button
                  className="btn-secondary"
                  onClick={() => setEditing(true)}
                >
                  수정
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  삭제
                </button>
              </div>
            )}
          </article>

          <CommentSection postId={postId} />
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <h1>글 수정</h1>
          {formError && <ErrorBox message={formError} />}
          <div>
            <label htmlFor="e-title" className="label">제목</label>
            <input
              id="e-title"
              className="field"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="e-content" className="label">내용</label>
            <textarea
              id="e-content"
              className="field min-h-48 resize-y"
              value={content}
              maxLength={5000}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleUpdate} disabled={saving}>
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setEditing(false);
                setTitle(post.title);
                setContent(post.content);
                setFormError("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
