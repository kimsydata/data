import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, Product, formatPrice } from "../api";
import { Spinner, ErrorBox } from "../components/Feedback";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getProduct(Number(id))
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-page py-16"><Spinner /></div>;
  if (error)
    return (
      <div className="container-page py-16">
        <ErrorBox message={error} />
        <Link to="/products" className="btn-secondary mt-6">
          ← 제품 목록으로
        </Link>
      </div>
    );
  if (!product) return null;

  return (
    <div className="container-page py-16">
      <Link to="/products" className="text-sm text-gray-500 hover:text-brand">
        ← 제품 목록으로
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-6xl" aria-hidden>
              🌿
            </div>
          )}
        </div>

        <div>
          <h1>{product.name}</h1>
          <p className="mt-2 text-gray-500">{product.summary}</p>
          <p className="mt-4 text-2xl font-bold text-brand-dark">
            {formatPrice(product.price)}
          </p>
          <hr className="my-6 border-gray-100" />
          <h2 className="text-lg">상세 설명</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">
            {product.description || "상세 설명이 준비 중입니다."}
          </p>
          <div className="mt-8">
            <a href="mailto:hello@greentech.co.kr" className="btn-primary">
              제품 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
