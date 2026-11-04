const SectionHeading = ({ title, text, tone = "light", as: Tag = "h2" }) => (
  <div className="max-w-2xl">
    <Tag className={`heading-lg ${tone === "dark" ? "text-white" : "text-text"}`}>{title}</Tag>
    {text && <p className={`mt-3 text-lg leading-8 ${tone === "dark" ? "text-white/70" : "text-muted"}`}>{text}</p>}
  </div>
);

export default SectionHeading;
