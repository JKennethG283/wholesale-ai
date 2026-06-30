import Link from "next/link";
import { catalogueCategories, customers, products, regions } from "@/lib/mock-data";
import {
  architectureLayers,
  complianceDisclaimer,
  navigationItems,
} from "@/lib/navigation";

export default function HomePage() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-lockup" href="/" aria-label="LiquorOps AI home">
            <span className="brand-mark">LO</span>
            <span className="brand-text">
              <strong>LiquorOps AI</strong>
              <span>Synthetic wholesale portal</span>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="Primary">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="catalogue-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="eyebrow">Catalogue-first ordering desk</p>
            <h1 id="home-title">LiquorOps AI</h1>
            <p className="lead">
              AI-powered wholesale ordering and automation for beverage distributors.
            </p>
            <p className="lead">
              A synthetic B2B liquor catalogue where buyers browse stock, compare
              region availability, and move straight from product discovery into
              operational workflows.
            </p>

            <div className="role-grid" aria-label="Role entry">
              <Link className="role-card" href="/catalogue" aria-label="Buyer / venue owner">
                <strong>Buyer / venue owner</strong>
                <span>Browse live-style stock, plan reorders, and review AI-guided product picks.</span>
              </Link>
              <Link className="role-card" href="/admin" aria-label="Wholesaler admin">
                <strong>Wholesaler admin</strong>
                <span>Track demand, stock risk, support issues, and generated workflow activity.</span>
              </Link>
            </div>
          </div>

          <aside className="ops-panel" aria-label="Catalogue preview">
            <div className="ops-panel-header">
              <strong>Wholesale catalogue console</strong>
              <span>{products.length} synthetic lines</span>
            </div>
            <div className="filter-strip">
              <div>
                <span>Search</span>
                <strong>pale ale, tonic, whisky</strong>
              </div>
              <div>
                <span>Region</span>
                <strong>{regions[0]}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{catalogueCategories[0]}</strong>
              </div>
            </div>
            <div className="product-table">
              {featuredProducts.map((product) => (
                <div className="product-row" key={product.id}>
                  <div>
                    <span>{product.category}</span>
                    <strong>{product.name}</strong>
                  </div>
                  <b className="stock-badge">{product.stock} cases</b>
                </div>
              ))}
            </div>
            <div className="ai-route">
              <span>AI route</span>
              <strong>Recommendation, reorder, and workflow triggers share the same operating data.</strong>
            </div>
          </aside>
        </section>

        <div className="ai-insight" role="note" aria-label="AI insight">
          <span aria-hidden="true">✦</span>
          <p>
            LiquorOps AI is an <strong>AI workflow system</strong>, not just an AI chatbot —
            recommendations, reorder prediction, support automation, email drafting, and reporting
            run on one shared data set and trigger connected automations.
          </p>
        </div>

        <section className="section-grid" aria-label="Catalogue and architecture summary">
          <div className="section-panel">
            <p className="eyebrow">Seeded catalogue</p>
            <h2>Product-heavy by design</h2>
            <p>
              The first slice seeds buyers, regions, catalogue categories, inventory,
              orders, POS sales, support tickets, email drafts, and workflow logs so
              later vertical slices have a realistic operating base.
            </p>
            <div className="category-grid">
              {catalogueCategories.map((category) => (
                <div className="category-chip" key={category}>
                  <strong>{category}</strong>
                  <span>Ready for wholesale filters</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel">
            <p className="eyebrow">Architecture</p>
            <h2>AI workflows across wholesale operations</h2>
            <div className="architecture-grid">
              {architectureLayers.map((layer) => (
                <div className="architecture-layer" key={layer.name}>
                  <strong>{layer.name}</strong>
                  <span>{layer.summary}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-panel" aria-label="Synthetic buyer coverage">
          <p className="eyebrow">Synthetic customers</p>
          <h2>Buyer accounts ready for future workflow slices</h2>
          <div className="category-grid">
            {customers.map((customer) => (
              <div className="category-chip" key={customer.id}>
                <strong>{customer.name}</strong>
                <span>
                  {customer.segment} / {customer.region}
                </span>
              </div>
            ))}
          </div>
        </section>

        <p className="disclaimer">{complianceDisclaimer}</p>
      </main>
    </div>
  );
}
