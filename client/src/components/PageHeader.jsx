import { Link } from "react-router-dom";

const PageHeader = ({ title, text, crumbs = [] }) => (
  <section className="border-b border-line bg-white">
    <div className="container-shell py-10 sm:py-14">
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-text">Home</Link></li>
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-text">{crumb.label}</Link>
                ) : (
                  <span aria-current="page" className="font-semibold text-text">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="heading-xl max-w-3xl text-text">{title}</h1>
      {text && <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{text}</p>}
    </div>
  </section>
);

export default PageHeader;
