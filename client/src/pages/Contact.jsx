import { CheckCircle2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { contactApi } from "../api/http";
import PageHeader from "../components/PageHeader";
import { business, whatsappLink } from "../data/store";

const emptyForm = { name: "", email: "", phone: "", message: "" };

const Contact = () => {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await contactApi.createContact(form);
      setForm(emptyForm);
      setStatus("sent");
    } catch (apiError) {
      setStatus("idle");
      setError(apiError.response?.data?.message || "Your message couldn't be sent. Check your connection and try again, or WhatsApp us.");
    }
  };

  const channels = [
    { Icon: Phone, label: "Call", value: business.phoneDisplay, href: business.phoneHref },
    { Icon: FaWhatsapp, label: "WhatsApp", value: business.phoneDisplay, href: whatsappLink(), external: true, iconClass: "text-[#1DA851]" },
    { Icon: Mail, label: "Email", value: business.email, href: `mailto:${business.email}` },
  ];

  return (
    <>
      <PageHeader
        title="Contact us"
        text="Questions about a product, a bulk order or an order you've placed? Reach us any of these ways."
        crumbs={[{ label: "Contact" }]}
      />

      <section className="bg-paper py-10 sm:py-14">
        <div className="container-shell grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <ul className="grid content-start gap-3">
            {channels.map(({ Icon, label, value, href, external, iconClass }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-4 rounded-xl border border-line bg-white p-5 transition hover:border-masking/30 hover:shadow-card"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-paper">
                    <Icon size={20} className={iconClass || "text-text"} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-muted">{label}</span>
                    <span className="block break-all font-bold text-text">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-line bg-white p-5 sm:p-8">
            {status === "sent" ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={44} className="mx-auto text-deal" aria-hidden="true" />
                <h2 className="heading-md mt-4 text-text">Message sent</h2>
                <p className="mt-2 text-muted">Thank you. We'll get back to you soon.</p>
                <button type="button" onClick={() => setStatus("idle")} className="btn-ghost mt-6">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="heading-md text-text">Send a message</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">Name</span>
                    <input className="input-field" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
                  </label>
                  <label className="block">
                    <span className="field-label">Phone</span>
                    <input className="input-field" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" required />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="field-label">Email</span>
                    <input className="input-field" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="field-label">Message</span>
                    <textarea className="input-field min-h-[140px]" name="message" value={form.message} onChange={handleChange} required />
                  </label>
                </div>
                {error && <p role="alert" className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
                <button type="submit" className="btn-dark mt-6 w-full sm:w-auto" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
