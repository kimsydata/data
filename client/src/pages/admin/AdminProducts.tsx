import { useEffect, useState } from "react";
import { api, Product, ProductInput, formatPrice } from "../../api";
import AdminShell from "./AdminShell";
import { Spinner, ErrorBox } from "../../components/Feedback";

const EMPTY: ProductInput = {
  name: "",
  price: 0,
  summary: "",
  description: "",
  imageUrl: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setProducts(await api.getProducts());
    } catch (e) {
      setListError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      summary: p.summary,
      description: p.description,
      imageUrl: p.imageUrl,
    });
    setFormError("");
    setShowForm(true);
  }

  async function handleSave() {
    setFormError("");
    if (!form.name.trim()) {
      setFormError("제품 이름은 필수입니다.");
      return;
    }
    if (!Number.isInteger(Number(form.price)) || Number(form.price) < 0) {
      setFormError("가격은 0 이상의 정수여야 합니다.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editId === null) await api.createProduct(payload);
      else await api.updateProduct(editId, payload);
      setShowForm(false);
      await load();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`'${name}' 제품을 삭제하시겠습니까?`)) return;
    try {
      await api.deleteProduct(id);
      await load();
    } catch (e) {
      setListError((e as Error).message);
    }
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">제품 관리</h1>
        <button className="btn-primary" onClick={openCreate}>
          + 제품 추가
        </button>
      </div>

      {listError && <div className="mt-4"><ErrorBox message={listError} /></div>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white ring-1 ring-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">가격</th>
                <th className="hidden px-4 py-3 md:table-cell">한줄설명</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(p.price)}</td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-gray-500 md:table-cell">
                    {p.summary}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        onClick={() => openEdit(p)}
                      >
                        수정
                      </button>
                      <button
                        className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(p.id, p.name)}
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

      {/* 추가/수정 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <h2 className="text-xl">
              {editId === null ? "제품 추가" : "제품 수정"}
            </h2>
            <div className="mt-5 space-y-4">
              {formError && <ErrorBox message={formError} />}
              <div>
                <label className="label" htmlFor="p-name">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  id="p-name"
                  className="field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-price">
                  가격(원) <span className="text-red-500">*</span>
                </label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  className="field"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="label" htmlFor="p-summary">한줄설명</label>
                <input
                  id="p-summary"
                  className="field"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="p-image">이미지 URL</label>
                <input
                  id="p-image"
                  className="field"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label" htmlFor="p-desc">상세설명</label>
                <textarea
                  id="p-desc"
                  className="field min-h-32 resize-y"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-ghost" onClick={() => setShowForm(false)}>
                취소
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
