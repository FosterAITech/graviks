import { Menu, Phone, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { business, categories } from "../data/store";
import Logo from "./Logo";

const pages = [
  { label: "Shop all", to: "/products" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const SearchForm = ({ onDone, className = "" }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    onDone?.();
  };

  return (
    <form role="search" onSubmit={submit} className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">Search products</label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search projector screens, books, bolts…"
        className="h-11 w-full rounded-[10px] border border-white/15 bg-white/10 pl-4 pr-12 text-[0.95rem] text-white outline-none transition placeholder:text-white/50 focus:border-lamp focus:bg-white/15"
      />
      <button type="submit" aria-label="Search" className="absolute right-1 top-1 grid h-9 w-10 place-items-center rounded-md bg-lamp text-masking">
        <Search size={18} />
      </button>
    </form>
  );
};

const Navbar = () => {
  const { count } = useCart();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const activeCategory = new URLSearchParams(location.search).get("category");

  return (
    <header className="sticky top-0 z-50 bg-masking text-white">
      <div className="container-shell flex h-16 items-center gap-4 sm:h-[72px] lg:gap-8">
        <Link to="/" aria-label="Garviks home" className="shrink-0">
          <Logo />
        </Link>

        <SearchForm className="hidden flex-1 md:block md:max-w-xl" />

        <nav aria-label="Main" className="ml-auto hidden items-center gap-6 lg:flex">
          {pages.map((page) => (
            <NavLink
              key={page.to}
              to={page.to}
              end
              className={({ isActive }) => `text-[0.95rem] font-semibold transition ${isActive && !location.search ? "text-lamp" : "text-white/80 hover:text-white"}`}
            >
              {page.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a href={business.phoneHref} className="hidden items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-semibold text-white/80 transition hover:text-white xl:inline-flex">
            <Phone size={16} aria-hidden="true" /> {business.phoneDisplay}
          </a>
          <Link
            to="/cart"
            className="relative inline-flex h-11 items-center gap-2 rounded-[10px] border border-white/15 px-3 font-semibold transition hover:border-white/40"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingCart size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-lamp px-1.5 text-xs font-extrabold text-masking">{count}</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="grid h-11 w-11 place-items-center rounded-[10px] border border-white/15 lg:hidden"
          >
            {isOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="border-t border-white/10 bg-[#1b1d21]">
        <nav aria-label="Categories" className="container-shell flex gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {categories.map((category) => {
            const selected = location.pathname === "/products" && activeCategory === category.key;
            return (
              <Link
                key={category.key}
                to={`/products?category=${category.key}`}
                className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                  selected ? "bg-white text-masking" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-masking lg:hidden">
          <div className="container-shell space-y-4 py-5">
            <SearchForm onDone={() => setIsOpen(false)} className="md:hidden" />
            <ul className="divide-y divide-white/10">
              {pages.map((page) => (
                <li key={page.to}>
                  <Link to={page.to} onClick={() => setIsOpen(false)} className="block py-3.5 text-lg font-bold">
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={business.phoneHref} className="btn-ghost-dark w-full">
              <Phone size={17} aria-hidden="true" /> Call {business.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
