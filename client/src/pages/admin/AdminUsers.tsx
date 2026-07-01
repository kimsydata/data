import { useEffect, useState } from "react";
import { api, AdminUser, formatDate } from "../../api";
import AdminShell from "./AdminShell";
import { Spinner, ErrorBox, EmptyState } from "../../components/Feedback";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setUsers(await api.adminGetUsers());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: number, username: string) {
    if (!confirm(`'${username}' 회원을 삭제하시겠습니까?`)) return;
    try {
      await api.adminDeleteUser(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleToggle(u: AdminUser) {
    const next = !u.active;
    const action = next ? "활성화" : "정지";
    if (!confirm(`'${u.username}' 회원을 ${action}하시겠습니까?`)) return;
    try {
      await api.adminSetUserActive(u.id, next);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl">회원 관리</h1>
      <p className="mt-2 text-sm text-gray-500">
        가입한 일반 회원 목록입니다. (관리자 계정은 표시되지 않습니다.)
      </p>

      {error && <div className="mt-4"><ErrorBox message={error} /></div>}

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <div className="mt-6">
          <EmptyState message="가입한 회원이 없습니다." />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">아이디</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">작성 글</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.username}
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                        활성
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                        정지
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.postCount}개</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className={
                          u.active
                            ? "rounded-md border border-amber-300 px-3 py-1 text-xs text-amber-700 hover:bg-amber-50"
                            : "rounded-md border border-brand px-3 py-1 text-xs text-brand hover:bg-brand-50"
                        }
                        onClick={() => handleToggle(u)}
                      >
                        {u.active ? "정지" : "해제"}
                      </button>
                      <button
                        className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(u.id, u.username)}
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
