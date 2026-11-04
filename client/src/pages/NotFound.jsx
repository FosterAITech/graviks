import { Link } from "react-router-dom";

const NotFound = () => (
  <section className="bg-paper py-20 sm:py-28">
    <div className="container-shell max-w-xl text-center">
      <p className="font-bold text-lamp-deep">Page not found</p>
      <h1 className="heading-lg mt-3 text-text">This page doesn't exist</h1>
      <p className="mt-3 text-muted">The link may be old or mistyped.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/products" className="btn-lamp">Browse products</Link>
        <Link to="/" className="btn-ghost">Go to home page</Link>
      </div>
    </div>
  </section>
);

export default NotFound;
