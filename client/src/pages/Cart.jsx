import { CheckCircle2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { leadApi } from "../api/http";
import ProductImage from "../components/ProductImage";
import { useCart } from "../context/CartContext";
import { business, formatPrice, whatsappLink } from "../data/store";

const emptyForm = { name: "", phone: "", email: "", address: "", city: "", pincode: "", message: "" };

const orderSummaryText = (order) => {
  const lines = order.items.map((item) => `• ${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`);
  return [
    "Hello Garviks, I've placed an order on your website.",
    "",
    ...lines,
    `Total: ${formatPrice(order.total)}`,
    "",
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Address: ${[order.address, order.city, order.pincode].filter(Boolean).join(", ")}`,
  ].join("\n");
};

const Cart = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await leadApi.createLead({
        ...form,
        items: items.map((item) => ({ product: item.id, quantity: item.quantity })),
      });
      setPlacedOrder(response.data.lead);
      clearCart();
      setForm(emptyForm);
      setStatus("done");
      window.scrollTo({ top: 0 });
    } catch (apiError) {
      setStatus("idle");
      setError(apiError.response?.data?.message || "Your order couldn't be sent. Check your connection and try again, or order on WhatsApp.");
    }
  };

  if (placedOrder) {
    return (
      <section className="bg-paper py-12 sm:py-16">
        <div className="container-shell max-w-2xl">
          <div className="rounded-xl border border-line bg-white p-6 text-center sm:p-10">
            <CheckCircle2 size={48} className="mx-auto text-deal" aria-hidden="true" />
            <h1 className="heading-lg mt-5 text-text">Thank you, your order is placed</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted">
              Our team will call or WhatsApp you on <span className="font-semibold text-text">{placedOrder.phone}</span> to confirm delivery and payment.
            </p>

            <ul className="mt-8 divide-y divide-line rounded-xl border border-line text-left">
              {placedOrder.items.map((item) => (
                <li key={item.product} className="flex justify-between gap-4 px-4 py-3">
                  <span className="text-text">{item.name} <span className="text-muted">× {item.quantity}</span></span>
                  <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 px-4 py-3 font-extrabold">
                <span>Total</span>
                <span>{formatPrice(placedOrder.total)}</span>
              </li>
            </ul>

            <p className="mt-8 text-sm text-muted">Want a faster reply? Send your order to us on WhatsApp too.</p>
            <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={whatsappLink(orderSummaryText(placedOrder))} target="_blank" rel="noopener noreferrer" className="btn-lamp">
                <FaWhatsapp size={18} aria-hidden="true" /> Send on WhatsApp
              </a>
              <Link to="/products" className="btn-ghost">Continue shopping</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-paper py-16 sm:py-24">
        <div className="container-shell max-w-xl text-center">
          <ShoppingCart size={44} className="mx-auto text-muted" aria-hidden="true" />
          <h1 className="heading-lg mt-5 text-text">Your cart is empty</h1>
          <p className="mt-3 text-muted">Add products from the shop and they'll appear here.</p>
          <Link to="/products" className="btn-lamp mt-8">Start shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper py-8 sm:py-12">
      <div className="container-shell">
        <h1 className="heading-lg text-text">Your cart</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* Items */}
          <div className="rounded-xl border border-line bg-white">
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                  <Link to={`/products/${item.slug}`} className="shrink-0">
                    <ProductImage src={item.image} alt="" category={item.category} className="h-20 w-20 rounded-lg sm:h-24 sm:w-24" imgClassName="p-1.5" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/products/${item.slug}`} className="line-clamp-2 font-bold leading-snug text-text hover:underline">
                        {item.name}
                      </Link>
                      <button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-sale">
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <p className="text-sm text-muted">{formatPrice(item.price)} each</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center rounded-[10px] border border-line" role="group" aria-label={`Quantity of ${item.name}`}>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity" className="grid h-9 w-9 place-items-center">
                          <Minus size={15} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity" className="grid h-9 w-9 place-items-center">
                          <Plus size={15} />
                        </button>
                      </div>
                      <span className="font-extrabold text-text">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line p-5">
              <span className="font-bold text-text">Subtotal</span>
              <span className="text-xl font-extrabold text-text">{formatPrice(subtotal)}</span>
            </div>
            <p className="border-t border-line px-5 py-4 text-sm text-muted">
              Final price, delivery charges and payment are confirmed by our team before dispatch.
            </p>
          </div>

          {/* Checkout */}
          <form onSubmit={handleSubmit} className="rounded-xl border border-line bg-white p-5 sm:p-7">
            <h2 className="heading-md text-text">Delivery details</h2>
            <p className="mt-1 text-sm text-muted">We'll contact you on this number to confirm your order.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Full name</span>
                <input className="input-field" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
              </label>
              <label className="block">
                <span className="field-label">Phone number</span>
                <input className="input-field" name="phone" type="tel" inputMode="tel" value={form.phone} onChange={handleChange} autoComplete="tel" required />
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Email <span className="font-normal text-muted">(optional)</span></span>
                <input className="input-field" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Address</span>
                <textarea className="input-field min-h-[88px]" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" required />
              </label>
              <label className="block">
                <span className="field-label">City</span>
                <input className="input-field" name="city" value={form.city} onChange={handleChange} autoComplete="address-level2" required />
              </label>
              <label className="block">
                <span className="field-label">Pincode</span>
                <input className="input-field" name="pincode" inputMode="numeric" pattern="[0-9]{6}" title="6-digit pincode" value={form.pincode} onChange={handleChange} autoComplete="postal-code" required />
              </label>
              <label className="block sm:col-span-2">
                <span className="field-label">Note <span className="font-normal text-muted">(optional)</span></span>
                <input className="input-field" name="message" value={form.message} onChange={handleChange} placeholder="e.g. best time to call" />
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
            )}

            <button type="submit" className="btn-lamp mt-6 w-full" disabled={status === "sending"}>
              {status === "sending" ? "Placing order…" : `Place order · ${formatPrice(subtotal)}`}
            </button>
            <p className="mt-3 text-center text-sm text-muted">
              Or call us on <a href={business.phoneHref} className="font-semibold text-text underline">{business.phoneDisplay}</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Cart;
