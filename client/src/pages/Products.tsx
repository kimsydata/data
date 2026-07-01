import { useEffect, useState } from "react";
import { api, Product } from "../api";
import ProductCard from "../components/ProductCard";
import { Spinner, ErrorBox, EmptyState } from "../components/Feedback";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <header className="mb-8">
        <h1>제품소개</h1>
        <p className="mt-3 text-gray-600">
          플라스틱을 대체하는 그린테크의 친환경 생활용품을 만나보세요.
        </p>
      </header>

      {loading && <Spinner />}
      {error && <ErrorBox message={error} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState message="등록된 제품이 없습니다." />
      )}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
