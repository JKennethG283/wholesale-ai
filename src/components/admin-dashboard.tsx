import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import {
  buildAdminDashboard,
  type DemandTrend,
  type StockRiskLevel,
} from "@/lib/admin-analytics";
import { buildWeeklyReport } from "@/lib/weekly-report";
import { navigationItems } from "@/lib/navigation";

const riskClass: Record<StockRiskLevel, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

function TrendIcon({ trend }: { trend: DemandTrend }) {
  if (trend === "up") {
    return <ArrowUpRight size={15} className="trend-up" aria-hidden="true" />;
  }
  if (trend === "down") {
    return <ArrowDownRight size={15} className="trend-down" aria-hidden="true" />;
  }
  return <ArrowRight size={15} className="trend-flat" aria-hidden="true" />;
}

export function AdminDashboard() {
  const dashboard = buildAdminDashboard();
  const report = buildWeeklyReport();

  const maxRegion = Math.max(...dashboard.salesByRegion.map((row) => row.revenue), 1);
  const maxCategory = Math.max(...dashboard.salesByCategory.map((row) => row.revenue), 1);

  const formatMoney = (value: number) => `$${value.toLocaleString()}`;

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

      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="admin-title">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 id="admin-title">Admin Dashboard</h1>
            <p>
              Operational intelligence for the wholesale team — sales, demand, stock risk, customer
              issues, and an AI-generated weekly business report with recommended actions.
            </p>
          </div>
        </section>

        <div className="ai-insight" role="note" aria-label="AI insight">
          <Sparkles size={18} aria-hidden="true" />
          <p>
            These panels are powered by the same <strong>AI workflow system</strong> driving
            ordering, recommendations, and support — every order and automation event feeds the
            demand, stock-risk, and weekly-report intelligence below.
          </p>
        </div>

        <div className="admin-grid">
          <section className="admin-card" role="region" aria-label="Top buyers">
            <h2>Top buyers</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Region</th>
                  <th>Orders</th>
                  <th>Spend</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topBuyers.map((buyer) => (
                  <tr key={buyer.customerId}>
                    <td>{buyer.name}</td>
                    <td>{buyer.region}</td>
                    <td>{buyer.orderCount}</td>
                    <td>{formatMoney(buyer.totalSpend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card" role="region" aria-label="Top-selling products">
            <h2>Top-selling products</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Cases</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.topProducts.slice(0, 5).map((product) => (
                  <tr key={product.productId}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.unitsSold}</td>
                    <td>{formatMoney(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card" role="region" aria-label="Sales by region">
            <h2>Sales by region</h2>
            <ul className="admin-bars">
              {dashboard.salesByRegion.map((row) => (
                <li key={row.region}>
                  <span className="admin-bar-label">{row.region}</span>
                  <span className="admin-bar-track">
                    <span
                      className="admin-bar-fill"
                      style={{ width: `${(row.revenue / maxRegion) * 100}%` }}
                    />
                  </span>
                  <span className="admin-bar-value">{formatMoney(row.revenue)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card" role="region" aria-label="Sales by category">
            <h2>Sales by category</h2>
            <ul className="admin-bars">
              {dashboard.salesByCategory.map((row) => (
                <li key={row.category}>
                  <span className="admin-bar-label">{row.category}</span>
                  <span className="admin-bar-track">
                    <span
                      className="admin-bar-fill admin-bar-alt"
                      style={{ width: `${(row.revenue / maxCategory) * 100}%` }}
                    />
                  </span>
                  <span className="admin-bar-value">{formatMoney(row.revenue)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-card" role="region" aria-label="Predicted demand">
            <h2>Predicted demand (next week)</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Base</th>
                  <th>Predicted</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.predictedDemand.map((row) => (
                  <tr key={row.productId}>
                    <td>{row.name}</td>
                    <td>{row.baseWeeklyUnits}</td>
                    <td>{row.predictedWeeklyUnits}</td>
                    <td>
                      <span className="trend-cell">
                        <TrendIcon trend={row.trend} /> {row.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card" role="region" aria-label="Stock risk">
            <h2>Stock risk</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>On hand</th>
                  <th>Reorder pt</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.stockRisk.map((row) => (
                  <tr key={row.productId}>
                    <td>{row.name}</td>
                    <td>{row.onHand}</td>
                    <td>{row.reorderPoint}</td>
                    <td>
                      <span className={`priority-badge ${riskClass[row.risk]}`}>{row.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="admin-card" role="region" aria-label="Customer issues">
            <h2>Customer issue summaries</h2>
            <ul className="admin-issues">
              {dashboard.customerIssues.map((issue) => (
                <li key={issue.ticketId}>
                  <span className="support-workflow-icon" aria-hidden="true">
                    <AlertTriangle size={15} />
                  </span>
                  <span>
                    <strong>{issue.customerName}</strong>
                    <span className="admin-issue-detail">
                      {issue.type} · {issue.priority} · {issue.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="admin-report" role="region" aria-label="Weekly business report">
          <div className="admin-report-head">
            <Sparkles size={18} aria-hidden="true" />
            <h2>{report.title}</h2>
          </div>
          <div className="admin-report-grid">
            {report.sections.map((section) => (
              <article key={section.id} className="admin-report-section">
                <h3>{section.heading}</h3>
                <ul>
                  {section.points.map((point, index) => (
                    <li key={`${section.id}-${index}`}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
