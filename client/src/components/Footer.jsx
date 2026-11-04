import { Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { business, categories, whatsappLink } from "../data/store";
import Logo from "./Logo";

const Footer = () => (
  <footer className="bg-masking text-white/65">
    <div className="container-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
      <div className="max-w-xs">
        <Link to="/" aria-label="Garviks home">
          <Logo />
        </Link>
        <p className="mt-5 leading-7">
          {business.name}. Projector screens and everyday essentials, ordered online and confirmed personally by our team.
        </p>
      </div>

      <div>
        <h2 className="font-bold text-white">Shop</h2>
        <ul className="mt-4 space-y-2.5">
          {categories.map((category) => (
            <li key={category.key}>
              <Link to={`/products?category=${category.key}`} className="transition hover:text-white">{category.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-white">Company</h2>
        <ul className="mt-4 space-y-2.5">
          <li><Link to="/about" className="transition hover:text-white">About us</Link></li>
          <li><Link to="/contact" className="transition hover:text-white">Contact</Link></li>
          <li><Link to="/#faq" className="transition hover:text-white">How ordering works</Link></li>
          <li><Link to="/cart" className="transition hover:text-white">Your cart</Link></li>
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-white">Talk to us</h2>
        <ul className="mt-4 space-y-3">
          <li>
            <a href={business.phoneHref} className="inline-flex items-center gap-3 transition hover:text-white">
              <Phone size={17} className="text-lamp" aria-hidden="true" /> {business.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 transition hover:text-white">
              <FaWhatsapp size={17} className="text-[#25D366]" aria-hidden="true" /> WhatsApp us
            </a>
          </li>
          <li>
            <a href={`mailto:${business.email}`} className="inline-flex items-center gap-3 break-all transition hover:text-white">
              <Mail size={17} className="shrink-0 text-lamp" aria-hidden="true" /> {business.email}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <div className="container-shell flex flex-col gap-2 py-5 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
        <Link to="/admin-login" className="transition hover:text-white/70">Staff login</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
