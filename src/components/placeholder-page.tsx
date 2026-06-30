import Link from "next/link";
import { navigationItems } from "@/lib/navigation";

type PlaceholderPageProps = {
  title: string;
  summary: string;
};

export function PlaceholderPage({ title, summary }: PlaceholderPageProps) {
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
      <main className="placeholder-main">
        <section className="placeholder-panel">
          <p className="eyebrow">Foundation route</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <p>
            This destination is reachable from the first shell and ready for the
            next vertical slice.
          </p>
        </section>
      </main>
    </div>
  );
}
