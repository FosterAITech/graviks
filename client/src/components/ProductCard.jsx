import { Check, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { categoryLabel, discountPercent, formatPrice } from "../data/store";
import ProductImage from "./ProductImage";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const price = formatPrice(product.price);
  const mrp = formatPrice(product.mrp);
  const off = discountPercent(product.price, product.mrp);
  const inStock = product.inStock !== false;
  const to = `/products/${product.slug || product._id}`;

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-card">
      <Link to={to} state={{ product }} className="relative block" tabIndex={-1} aria-hidden="true">
        <ProductImage src={product.image} category={product.category} className="aspect-square" imgClassName="p-4 transition duration-300 group-hover:scale-[1.03]" />
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-sale px-2 py-1 text-xs font-bold text-white">{off}% off</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{categoryLabel(product.category)}</p>
        <h3 className="mt-1.5 line-clamp-2 font-bold leading-snug text-text">
          <Link to={to} state={{ product }} className="hover:underline hover:decoration-lamp hover:decoration-2 hover:underline-offset-4">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {price ? (
            <span className="text-xl font-extrabold text-text">{price}</span>
          ) : (
            <span className="font-bold text-text">Price on request</span>
          )}
          {mrp && off > 0 && <span className="text-sm text-muted line-through">{mrp}</span>}
        </div>

        <div className="mt-auto pt-4">
          {inStock && price ? (
            <button type="button" onClick={handleAdd} className={`w-full px-3 text-sm sm:text-[0.95rem] ${added ? "btn-dark" : "btn-lamp"}`} aria-live="polite">
              {added ? (
                <>
                  <Check size={18} className="hidden sm:block" aria-hidden="true" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart size={18} className="hidden sm:block" aria-hidden="true" /> Add to cart
                </>
              )}
            </button>
          ) : (
            <Link to={to} state={{ product }} className="btn-ghost w-full px-3 text-sm sm:text-[0.95rem]">
              {inStock ? "See details" : "Out of stock"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
