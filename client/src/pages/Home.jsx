import { ArrowRight, BookOpen, Flame, MessageSquareText, PackageCheck, Phone, Projector, Shirt, ShoppingCart, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { productApi, testimonialApi } from "../api/http";
import AnimatedSection from "../components/AnimatedSection";
import FAQAccordion from "../components/FAQAccordion";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import TestimonialCarousel from "../components/TestimonialCarousel";
import { business, categories, faqs, screenGuide, whatsappLink } from "../data/store";
import { getImmediateProducts, saveCachedProducts } from "../utils/productCatalog";

const categoryIcons = {
  "projector-screens": Projector,
  books: BookOpen,
  hardware: Wrench,
  clothing: Shirt,
  crackers: Flame,
};

const steps = [
  { Icon: ShoppingCart, title: "Add to cart", text: "Pick your products and quantities." },
  { Icon: MessageSquareText, title: "Send your order", text: "Share your name, phone number and delivery address." },
  { Icon: PackageCheck, title: "We confirm and deliver", text: "Our team calls or WhatsApps you to confirm price, delivery and payment." },
];

// Featured products (Top 1–6 in the admin panel) come first.
const sortFeatured = (list = []) =>
  [...list].sort((a, b) => (Number(a.topProductRank) || 99) - (Number(b.topProductRank) || 99));

const Home = () => {
  const [products, setProducts] = useState(() => sortFeatured(getImmediateProducts("all")).slice(0, 8));
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    productApi
      .getProducts({ limit: 8, page: 1, fields: "name,slug,image,category,price,mrp,inStock,topProductRank" })
      .then((response) => {
        const list = Array.isArray(response.data) ? sortFeatured(response.data) : [];
        setProducts(list);
        saveCachedProducts("all", list);
      })
      .catch(() => {});

    testimonialApi
      .getTestimonials()
      .then((response) => setTestimonials(Array.isArray(response.data) ? response.data : []))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Hero: a projection screen */}
      <section className="relative overflow-hidden bg-masking">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-40 h-[640px] w-[900px] rotate-[18deg] bg-[radial-gradient(ellipse_at_left,rgba(242,166,31,0.28),transparent_62%)]"
        />
        <div className="container-shell relative py-10 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-5xl rounded-[6px] border-[10px] border-black bg-white shadow-luxe sm:border-[14px] lg:aspect-[16/9]">
            <div className="flex h-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
              <p className="text-sm font-bold text-lamp-deep">{business.name}</p>
              <h1 className="heading-xl mt-3 max-w-2xl text-text">Turn any wall into a big screen.</h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
                Foldable projector screens for movies, sport and events, plus books, nuts and bolts, clothing and festive crackers. Order online and our team confirms with you personally.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/products?category=projector-screens" className="btn-lamp">
                  Shop projector screens <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/products" className="btn-ghost">
                  Browse all products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <AnimatedSection className="bg-paper py-12 sm:py-16">
        <div className="container-shell">
          <h2 className="heading-md text-text">Shop by category</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.key];
              return (
                <li key={category.key} className={index === 0 ? "col-span-2 md:col-span-1" : ""}>
                  <Link
                    to={`/products?category=${category.key}`}
                    className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition hover:border-masking/30 hover:shadow-card"
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-lg ${index === 0 ? "bg-lamp text-masking" : "bg-paper text-text"}`}>
                      <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="mt-4 font-bold text-text">{category.label}</span>
                    <span className="mt-1 text-sm leading-6 text-muted">{category.blurb}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </AnimatedSection>

      {/* Products */}
      <AnimatedSection id="featured" className="bg-paper pb-16 sm:pb-20">
        <div className="container-shell">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading title="Featured products" />
            <Link to="/products" className="text-link shrink-0">
              View all products <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-line bg-white p-10 text-center">
              <p className="text-muted">New products are being added. Message us for what's in stock today.</p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-dark mt-5">
                <FaWhatsapp size={18} aria-hidden="true" /> Ask on WhatsApp
              </a>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Screen guide */}
      <AnimatedSection className="section-padding bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              title="Choosing a projector screen"
              text="Four things to check before you buy, so the picture looks right in your room."
            />
            <Link to="/products?category=projector-screens" className="btn-dark mt-8">
              See projector screens
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {screenGuide.map((tip) => (
              <li key={tip.title} className="rounded-xl bg-paper p-6">
                <h3 className="heading-md text-text">{tip.title}</h3>
                <p className="mt-2 leading-7 text-muted">{tip.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </AnimatedSection>

      {/* How ordering works */}
      <AnimatedSection id="how-it-works" className="section-padding border-t border-line bg-white">
        <div className="container-shell">
          <SectionHeading title="How ordering works" text="No online payment needed to place an order." />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(({ Icon, title, text }, index) => (
              <li key={title} className="relative rounded-xl border border-line p-6">
                <span className="text-sm font-bold text-lamp-deep">Step {index + 1}</span>
                <Icon size={26} strokeWidth={1.75} className="mt-4 text-text" aria-hidden="true" />
                <h3 className="heading-md mt-4 text-text">{title}</h3>
                <p className="mt-2 leading-7 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </AnimatedSection>

      {/* Reviews: shown once real reviews are added in the admin panel */}
      {testimonials.length > 0 && (
        <AnimatedSection id="reviews" className="section-padding bg-paper">
          <div className="container-shell">
            <SectionHeading title="What customers say" />
            <div className="mt-8">
              <TestimonialCarousel testimonials={testimonials} />
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* FAQ */}
      <AnimatedSection id="faq" className="section-padding bg-paper">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <SectionHeading title="Questions about ordering" text="Ordering, payment, delivery and bulk orders." />
          <FAQAccordion items={faqs} />
        </div>
      </AnimatedSection>

      {/* Contact band */}
      <section className="bg-masking text-white">
        <div className="container-shell flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="heading-lg text-white">Need a bulk order or something not listed?</h2>
            <p className="mt-2 text-lg text-white/70">Tell us what you need and we'll check stock and pricing for you.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href={whatsappLink("Hello Garviks, I'd like to place a bulk order.")} target="_blank" rel="noopener noreferrer" className="btn-lamp">
              <FaWhatsapp size={18} aria-hidden="true" /> WhatsApp us
            </a>
            <a href={business.phoneHref} className="btn-ghost-dark">
              <Phone size={17} aria-hidden="true" /> {business.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
