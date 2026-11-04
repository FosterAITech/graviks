import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productApi } from "../api/http";
import ProductCard from "../components/ProductCard";
import { categories, categoryLabel } from "../data/store";
import { getImmediateProducts, saveCachedProducts } from "../utils/productCatalog";

const PER_PAGE = 12;
const validCategories = new Set(categories.map((item) => item.key));

const Products = () => {
  const [searchParams] = useSearchParams();
  const rawCategory = searchParams.get("category");
  const category = validCategories.has(rawCategory) ? rawCategory : "all";
  const query = (searchParams.get("q") || "").trim();
  const filterKey = `${category}|${query}`;

  const [state, setState] = useState(() => ({
    key: filterKey,
    products: query ? [] : getImmediateProducts(category).slice(0, PER_PAGE),
    total: 0,
    page: 1,
    loading: true,
    error: false,
  }));

  // Reset when the category or search changes.
  if (state.key !== filterKey) {
    setState({ key: filterKey, products: query ? [] : getImmediateProducts(category).slice(0, PER_PAGE), total: 0, page: 1, loading: true, error: false });
  }

  const { page } = state;

  useEffect(() => {
    let active = true;
    productApi
      .getProducts({
        ...(category !== "all" ? { category } : {}),
        ...(query ? { q: query } : {}),
        limit: PER_PAGE,
        page,
        fields: "name,slug,image,category,price,mrp,inStock",
      })
      .then((response) => {
        if (!active) return;
        const data = Array.isArray(response.data) ? response.data : [];
        const total = Number(response.headers?.["x-total-count"] || data.length);
        setState((current) => {
          const products = page === 1 ? data : [...current.products, ...data];
          if (!query && page === 1) saveCachedProducts(category, products);
          return { ...current, products, total, loading: false, error: false };
        });
      })
      .catch(() => {
        if (active) setState((current) => ({ ...current, loading: false, error: true }));
      });
    return () => {
      active = false;
    };
  }, [category, query, page]);

  const title = query ? `Results for “${query}”` : category === "all" ? "All products" : categoryLabel(category);
  const { products, total, loading, error } = state;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-shell py-8 sm:py-10">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link to="/" className="hover:text-text">Home</Link> <span aria-hidden="true">/</span>{" "}
            <span aria-current="page" className="font-semibold text-text">Shop</span>
          </nav>
          <h1 className="heading-lg mt-3 text-text">{title}</h1>
          {!loading && !error && (
            <p className="mt-1 text-muted">
              {total} product{total === 1 ? "" : "s"}
            </p>
          )}

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Categories">
            {[{ key: "all", label: "All" }, ...categories].map((item) => {
              const selected = !query && category === item.key;
              return (
                <Link
                  key={item.key}
                  role="tab"
                  aria-selected={selected}
                  to={item.key === "all" ? "/products" : `/products?category=${item.key}`}
                  className={`chip shrink-0 ${selected ? "border-masking bg-masking text-white" : "border-line bg-white text-text hover:border-masking/40"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {query && (
            <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-text">
              <X size={15} aria-hidden="true" /> Clear search
            </Link>
          )}
        </div>
      </section>

      <section className="bg-paper py-8 sm:py-12">
        <div className="container-shell">
          {error && products.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-10 text-center">
              <p className="font-bold text-text">Products couldn't be loaded.</p>
              <p className="mt-1 text-muted">Check your internet connection and refresh the page.</p>
            </div>
          ) : !loading && products.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-10 text-center">
              <Search size={32} className="mx-auto text-muted" aria-hidden="true" />
              <p className="mt-4 font-bold text-text">{query ? "No products match your search." : "No products in this category yet."}</p>
              <p className="mt-1 text-muted">Try another category, or contact us and we'll check stock for you.</p>
              <Link to="/contact" className="btn-dark mt-6">Contact us</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4" aria-busy={loading}>
                {products.map((product) => (
                  <ProductCard key={product._id || product.slug} product={product} />
                ))}
              </div>
              {products.length < total && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    className="btn-ghost min-w-[220px]"
                    disabled={loading}
                    onClick={() => setState((current) => ({ ...current, page: current.page + 1, loading: true }))}
                  >
                    {loading ? "Loading…" : "Show more products"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Products;
