import { Link } from "react-router-dom";
import { Product, formatPrice } from "../api";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="card group flex flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl" aria-hidden>
            🌿
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base">{product.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">
          {product.summary}
        </p>
        <p className="mt-3 font-bold text-brand-dark">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
