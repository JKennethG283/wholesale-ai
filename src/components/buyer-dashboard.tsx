"use client";

import Link from "next/link";
import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { buildBuyerInsights } from "@/lib/buyer-analytics";
import { customers } from "@/lib/mock-data";
import { navigationItems } from "@/lib/navigation";

function money(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    currency: "AUD",
    style: "currency",
    maximumFractionDigits: 0,
  }).format(amount);
}

const riskTone: Record<string, string> = {
  High: "risk-high",
  Medium: "risk-medium",
  Low: "risk-low",
};

export function BuyerDashboard() {
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const insights = useMemo(() => buildBuyerInsights(customerId), [customerId]);

  const totalSpend = insights.monthlySpend.reduce((sum, month) => sum + month.amount, 0);
  const maxMonthlySpend = Math.max(1, ...insights.monthlySpend.map((month) => month.amount));
  const maxWeeklyUnits = Math.max(1, ...insights.posSales.map((point) => point.weeklyUnits));
  const highRiskCount = insights.reorderPredictions.filter(
    (prediction) => prediction.reorderRisk === "High",
  ).length;

  const spendChartLabel = `Monthly spend trend: ${insights.monthlySpend
    .map((month) => `${month.month} ${money(month.amount)}`)
    .join(", ")}`;
  const posChartLabel = `Weekly POS sales: ${insights.posSales
    .map((point) => `${point.name} ${point.weeklyUnits} cases`)
    .join(", ")}`;

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
        <section className="dashboard-title-band" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Buyer intelligence</p>
            <h1 id="dashboard-title">Buyer dashboard</h1>
            <p>
              Purchase history, spend trends, POS velocity, reorder predictions, and grounded AI
              insights for {insights.customer.name}.
            </p>
          </div>
          <label className="control">
            <span>Buyer account</span>
            <select
              aria-label="Buyer account"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="dashboard-kpis" aria-label="Key metrics">
          <article className="kpi-card">
            <span>Total spend</span>
            <strong>{money(totalSpend)}</strong>
            <p>{insights.previousOrders.length} orders on record</p>
          </article>
          <article className="kpi-card">
            <span>Spend trend</span>
            <strong className={`trend-${insights.spendTrend.direction}`}>
              {insights.spendTrend.direction === "down" ? (
                <TrendingDown aria-hidden="true" size={18} />
              ) : (
                <TrendingUp aria-hidden="true" size={18} />
              )}
              {Math.abs(insights.spendTrend.changePct)}%
            </strong>
            <p>vs the prior month</p>
          </article>
          <article className="kpi-card">
            <span>High reorder risk</span>
            <strong>{highRiskCount}</strong>
            <p>products need attention</p>
          </article>
          <article className="kpi-card">
            <span>Predicted next order</span>
            <strong>
              {insights.predictedNextOrder ? money(insights.predictedNextOrder.estimatedTotal) : "—"}
            </strong>
            <p>{insights.predictedNextOrder ? `around ${insights.predictedNextOrder.date}` : "no reorder due"}</p>
          </article>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-panel" aria-label="Previous orders">
            <h2>Previous orders</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {insights.previousOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.date}</td>
                    <td>
                      <span className="status-chip">{order.status}</span>
                    </td>
                    <td>{order.itemCount}</td>
                    <td>{money(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="dashboard-panel" aria-label="Monthly spend">
            <h2>Monthly spend</h2>
            <div className="bar-chart" role="img" aria-label={spendChartLabel}>
              {insights.monthlySpend.map((month) => (
                <div className="bar-column" key={month.month} aria-hidden="true">
                  <span className="bar-value">{money(month.amount)}</span>
                  <span
                    className="bar"
                    style={{ height: `${Math.round((month.amount / maxMonthlySpend) * 100)}%` }}
                  />
                  <span className="bar-label">{month.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel" aria-label="Most purchased products">
            <h2>Most purchased products</h2>
            <ul className="ranked-list">
              {insights.mostPurchasedProducts.map((product) => (
                <li key={product.productId}>
                  <span>{product.name}</span>
                  <span className="ranked-meta">
                    {product.totalCases} cases · {money(product.totalSpend)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="dashboard-panel" aria-label="Weekly POS sales">
            <h2>POS sales velocity</h2>
            <div className="bar-chart bar-chart-horizontal" role="img" aria-label={posChartLabel}>
              {insights.posSales.map((point) => (
                <div className="hbar-row" key={point.productId} aria-hidden="true">
                  <span className="hbar-label">{point.name}</span>
                  <span className="hbar-track">
                    <span
                      className="hbar-fill"
                      style={{ width: `${Math.round((point.weeklyUnits / maxWeeklyUnits) * 100)}%` }}
                    />
                  </span>
                  <span className="hbar-value">{point.weeklyUnits}/wk</span>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-panel reorder-panel" aria-label="Reorder suggestions">
            <h2>Reorder suggestions</h2>
            <ul className="reorder-list">
              {insights.reorderPredictions.map((prediction) => (
                <li key={prediction.productId}>
                  <div className="reorder-head">
                    <span>{prediction.name}</span>
                    <span className={`risk-pill ${riskTone[prediction.reorderRisk]}`}>
                      {prediction.reorderRisk} risk
                    </span>
                  </div>
                  <dl className="reorder-facts">
                    <div>
                      <dt>Est. stock left</dt>
                      <dd>{prediction.estimatedStockRemaining} cases</dd>
                    </div>
                    <div>
                      <dt>Reorder by</dt>
                      <dd>{prediction.predictedReorderDate}</dd>
                    </div>
                    <div>
                      <dt>Suggested qty</dt>
                      <dd>{prediction.suggestedQuantity} cases</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>

          <section className="dashboard-panel next-order-panel" aria-label="Predicted next order">
            <h2>Predicted next order</h2>
            {insights.predictedNextOrder ? (
              <dl className="summary-list">
                <div>
                  <dt>Target date</dt>
                  <dd>{insights.predictedNextOrder.date}</dd>
                </div>
                <div>
                  <dt>Product lines</dt>
                  <dd>{insights.predictedNextOrder.lineCount}</dd>
                </div>
                <div>
                  <dt>Estimated cases</dt>
                  <dd>{insights.predictedNextOrder.estimatedUnits}</dd>
                </div>
                <div className="summary-total">
                  <dt>Estimated total</dt>
                  <dd>{money(insights.predictedNextOrder.estimatedTotal)}</dd>
                </div>
              </dl>
            ) : (
              <p>Stock comfortably covers current demand. No reorder is predicted yet.</p>
            )}
            <Link className="dashboard-cta" href="/cart">
              Build this order in the cart
            </Link>
          </section>

          <section className="dashboard-panel ai-insights-panel" aria-label="AI insights">
            <h2>
              <Sparkles aria-hidden="true" size={18} />
              AI insights
            </h2>
            <ul className="insight-list">
              {insights.aiInsights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
