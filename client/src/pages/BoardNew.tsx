import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../components/ProtectedRoute";
import { ErrorBox } from "../components/Feedback";

export default function BoardNew() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력하세요.");
      return;
    }
    setSaving(true);
    try {
      const post = await api.createPost({ title, content });
      navigate(`/board/${post.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page max-w-2xl py-16">
      <h1>글쓰기</h1>
      <p className="mt-2 text-sm text-gray-500">
        작성자: <span className="font-medium text-gray-700">{username}</span>
      </p>

      <div className="mt-8 space-y-5">
        {error && <ErrorBox message={error} />}

        <div>
          <label htmlFor="title" className="label">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            className="field"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요 (최대 100자)"
          />
        </div>

        <div>
          <label htmlFor="content" className="label">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            className="field min-h-48 resize-y"
            value={content}
            maxLength={5000}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요 (최대 5000자)"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {content.length} / 5000
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "등록 중..." : "등록"}
          </button>
          <Link to="/board" className="btn-secondary">
            취소
          </Link>
        </div>
      </div>
    </div>
  );
}
