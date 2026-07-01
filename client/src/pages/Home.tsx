import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Product } from "../api";
import ProductCard from "../components/ProductCard";
import { Spinner, ErrorBox } from "../components/Feedback";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProducts()
      .then((all) => setProducts(all.slice(0, 3)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* 히어로 */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-dark">
              친환경 생활용품
            </span>
            <h1 className="mt-4 leading-tight">
              지구를 생각하는
              <br />
              친환경 기술, <span className="text-brand">그린테크</span>
            </h1>
            <p className="mt-4 max-w-md text-gray-600">
              플라스틱을 줄이고 자연으로 돌아가는 제품을 만듭니다. 일상의 작은
              교체가 모여 큰 변화를 만듭니다.
            </p>
            <div className="mt-8">
              <Link to="/products" className="btn-primary">
                제품 보러가기
              </Link>
            </div>
          </div>
          <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-brand/10 text-[7rem]">
            <span aria-hidden>🌍</span>
          </div>
        </div>
      </section>

      {/* 대표 제품 미리보기 */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2>대표 제품</h2>
          <Link to="/products" className="text-sm font-semibold text-brand hover:underline">
            전체 보기 →
          </Link>
        </div>

        {loading && <Spinner />}
        {error && <ErrorBox message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
