import { Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { productApi } from "../api/http";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/CartContext";
import { business, categoryLabel, discountPercent, formatPrice, parsePrice, whatsappLink } from "../data/store";
import { getImmediateProductBySlug, saveCachedProducts } from "../utils/productCatalog";

const ProductDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const initial = location.state?.product?.slug === slug ? location.state.product : getImmediateProductBySlug(slug);
  const [data, setData] = useState({ slug, product: initial, related: [], status: initial ? "ready" : "loading" });
  const [photoIndex, setPhotoIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset when moving to another product.
  if (data.slug !== slug) {
    const next = getImmediateProductBySlug(slug);
    setData({ slug, product: next, related: [], status: next ? "ready" : "loading" });
    setPhotoIndex(0);
    setQuantity(1);
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
    let active = true;
    productApi
      .getProductBySlug(slug, { related: true, relatedLimit: 4 })
      .then((response) => {
        if (!active) return;
        const product = response.data.product || response.data;
        const related = Array.isArray(response.data.relatedProducts) ? response.data.relatedProducts : [];
        setData({ slug, product, related, status: "ready" });
        saveCachedProducts("all", [product, ...related]);
      })
      .catch((error) => {
        if (!active) return;
        setData((current) => ({ ...current, status: error.response?.status === 404 ? "missing" : current.product ? "ready" : "error" }));
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const { product, related, status } = data;
  const photos = useMemo(
    () => Array.from(new Set([product?.image, ...(Array.isArray(product?.gallery) ? product.gallery : [])].filter(Boolean))),
    [product]
  );

  if (status === "loading") {
    return (
      <div className="container-shell grid gap-8 py-10 lg:grid-cols-2" aria-busy="true">
        <div className="aspect-square animate-pulse rounded-xl bg-white" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-white" />
          <div className="h-6 w-1/3 animate-pulse rounded bg-white" />
          <div className="h-24 animate-pulse rounded bg-white" />
        </div>
      </div>
    );
  }

  if (status === "missing" || status === "error" || !product) {
    return (
      <div className="container-shell py-20 text-center">
        <h1 className="heading-lg text-text">{status === "error" ? "This product couldn't be loaded" : "Product not found"}</h1>
        <p className="mt-3 text-muted">
          {status === "error" ? "Check your connection and refresh the page." : "It may have been removed or renamed."}
        </p>
        <Link to="/products" className="btn-dark mt-8">Browse all products</Link>
      </div>
    );
  }

  const price = formatPrice(product.price);
  const mrp = formatPrice(product.mrp);
  const off = discountPercent(product.price, product.mrp);
  const inStock = product.inStock !== false;
  const canBuy = inStock && Boolean(price);
  const features = Array.isArray(product.features) ? product.features.filter(Boolean) : [];
  const currentPhoto = photos[Math.min(photoIndex, Math.max(photos.length - 1, 0))];

  const handleAdd = (goToCart = false) => {
    addItem(product, quantity);
    if (goToCart) {
      navigate("/cart");
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="border-b border-line bg-white">
        <nav aria-label="Breadcrumb" className="container-shell flex flex-wrap items-center gap-2 py-3 text-sm text-muted">
          <Link to="/" className="hover:text-text">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-text">{categoryLabel(product.category)}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate font-semibold text-text">{product.name}</span>
        </nav>
      </div>

      <section className="bg-white py-8 sm:py-12">
        <div className="container-shell grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Photos */}
          <div>
            <div className="relative overflow-hidden rounded-xl border border-line">
              <ProductImage src={currentPhoto} alt={product.name} category={product.category} className="aspect-square" imgClassName="p-6" eager />
              {off > 0 && <span className="absolute left-4 top-4 rounded-md bg-sale px-2.5 py-1 text-sm font-bold text-white">{off}% off</span>}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((index) => (index - 1 + photos.length) % photos.length)}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-text shadow-card"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoIndex((index) => (index + 1) % photos.length)}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-text shadow-card"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product photos">
                {photos.map((photo, index) => (
                  <li key={`${photo.slice(0, 40)}-${index}`} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setPhotoIndex(index)}
                      aria-label={`Show photo ${index + 1}`}
                      aria-current={index === photoIndex}
                      className={`block h-20 w-20 overflow-hidden rounded-lg border-2 bg-paper ${index === photoIndex ? "border-masking" : "border-transparent opacity-75 hover:opacity-100"}`}
                    >
                      <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.06em] text-muted">{categoryLabel(product.category)}</p>
            <h1 className="mt-2 text-[1.75rem] font-extrabold leading-tight tracking-[-0.015em] text-text sm:text-4xl">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {price ? <span className="text-3xl font-extrabold text-text">{price}</span> : <span className="text-xl font-bold">Price on request</span>}
              {mrp && off > 0 && (
                <>
                  <span className="text-lg text-muted line-through">{mrp}</span>
                  <span className="font-bold text-deal">You save {formatPrice(parsePrice(product.mrp) - parsePrice(product.price))} ({off}%)</span>
                </>
              )}
            </div>
            <p className={`mt-2 font-semibold ${inStock ? "text-deal" : "text-sale"}`}>{inStock ? "In stock" : "Currently out of stock"}</p>

            {product.shortDescription && <p className="mt-5 text-lg leading-8 text-muted">{product.shortDescription}</p>}

            {canBuy ? (
              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-text" id="qty-label">Quantity</span>
                  <div className="flex items-center rounded-[10px] border border-line" role="group" aria-labelledby="qty-label">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="grid h-11 w-11 place-items-center text-text disabled:opacity-40" disabled={quantity <= 1}>
                      <Minus size={17} />
                    </button>
                    <span className="w-10 text-center font-bold" aria-live="polite">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label="Increase quantity" className="grid h-11 w-11 place-items-center text-text">
                      <Plus size={17} />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => handleAdd(false)} className="btn-ghost">
                    {added ? <><Check size={18} aria-hidden="true" /> Added to cart</> : <><ShoppingCart size={18} aria-hidden="true" /> Add to cart</>}
                  </button>
                  <button type="button" onClick={() => handleAdd(true)} className="btn-lamp">
                    Buy now
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-7 rounded-xl bg-paper p-4 text-muted">
                {inStock ? "Contact us for the price of this product." : "Message us and we'll tell you when it's back in stock."}
              </p>
            )}

            <a
              href={whatsappLink(`Hello Garviks, I have a question about ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-3 w-full"
            >
              <FaWhatsapp size={18} className="text-[#1DA851]" aria-hidden="true" /> Ask about this on WhatsApp
            </a>

            <p className="mt-6 flex items-start gap-3 rounded-xl bg-paper p-4 text-sm leading-6 text-muted">
              <Truck size={20} className="mt-0.5 shrink-0 text-text" aria-hidden="true" />
              After you order, our team calls or WhatsApps you on your number to confirm delivery and payment. Questions? Call {business.phoneDisplay}.
            </p>

            {(product.size || features.length > 0 || product.description) && (
              <div className="mt-8 space-y-6 border-t border-line pt-8">
                {product.size && (
                  <div className="flex justify-between gap-6">
                    <span className="text-muted">Size</span>
                    <span className="text-right font-semibold text-text">{product.size}</span>
                  </div>
                )}
                {features.length > 0 && (
                  <div>
                    <h2 className="heading-md text-text">Highlights</h2>
                    <ul className="mt-3 space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex gap-3 leading-7 text-text">
                          <Check size={18} className="mt-1 shrink-0 text-deal" aria-hidden="true" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.description && product.description !== product.shortDescription && (
                  <div>
                    <h2 className="heading-md text-text">Description</h2>
                    <p className="mt-3 whitespace-pre-line leading-7 text-muted">{product.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper py-12 sm:py-16">
          <div className="container-shell">
            <h2 className="heading-lg text-text">You may also like</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item._id || item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetails;
