import { ArrowRight, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { sectionItemApi } from "../api/http";
import PageHeader from "../components/PageHeader";
import SectionHeading from "../components/SectionHeading";
import { business, categories, team as defaultTeam, whatsappLink } from "../data/store";

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const About = () => {
  const [team, setTeam] = useState(defaultTeam);

  // Team members added in the admin panel replace the default list.
  useEffect(() => {
    sectionItemApi
      .getItems("team", { limit: 12 })
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) setTeam(response.data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        title="About Garviks"
        text={`${business.name} sells projector screens and everyday essentials, with a real person confirming every order.`}
        crumbs={[{ label: "About" }]}
      />

      <section className="section-padding bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading title="What we do" />
            <div className="mt-4 space-y-4 text-lg leading-8 text-muted">
              <p>
                Our main product is the projector screen: foldable, easy-to-hang screens that turn a living room, office, classroom or terrace into a big-screen space.
              </p>
              <p>
                Alongside screens we stock books, nuts and bolts, clothing and, in season, festive crackers. You order on the website and our team calls or WhatsApps you to confirm the details before anything is sent.
              </p>
            </div>
          </div>
          <ul className="grid content-start gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <li key={category.key}>
                <Link
                  to={`/products?category=${category.key}`}
                  className="group flex h-full flex-col rounded-xl border border-line p-5 transition hover:border-masking/30 hover:shadow-card"
                >
                  <span className="font-bold text-text">{category.label}</span>
                  <span className="mt-1 flex-1 text-sm leading-6 text-muted">{category.blurb}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-text">
                    Shop <ArrowRight size={15} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="team" className="section-padding bg-paper">
        <div className="container-shell">
          <SectionHeading title="Our team" text="The people who answer your calls and look after your orders." />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <li key={member._id || member.name} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5">
                {member.image ? (
                  <img src={member.image} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-masking text-lg font-extrabold text-lamp">
                    {initials(member.name)}
                  </span>
                )}
                <span>
                  <span className="block font-bold text-text">{member.name}</span>
                  {member.role && <span className="block text-sm text-muted">{member.role}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-masking text-white">
        <div className="container-shell flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <h2 className="heading-lg text-white">Questions? Talk to us directly.</h2>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn-lamp">
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

export default About;
