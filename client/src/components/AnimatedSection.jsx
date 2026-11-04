// A page section with an anchor offset for the sticky header.
const AnimatedSection = ({ children, className = "", id }) => (
  <section id={id} className={className} style={{ scrollMarginTop: "5.5rem" }}>
    {children}
  </section>
);

export default AnimatedSection;
