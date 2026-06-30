"use client";

import { PlugZap, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { buildPosInsights } from "@/lib/pos-insights";
import { customers } from "@/lib/mock-data";
import { AppShell } from "@/components/app-shell";

export function PosWorkflow() {
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const [connected, setConnected] = useState(false);

  const insights = useMemo(() => buildPosInsights(customerId), [customerId]);
  const selectedCustomer =
    customers.find((customer) => customer.id === customerId) ?? customers[0];

  const maxCategoryUnits = Math.max(
    1,
    ...insights.categoryTrends.map((trend) => trend.weeklyUnits),
  );
  const categoryChartLabel = `Category trends: ${insights.categoryTrends
    .map((trend) => `${trend.category} ${trend.weeklyUnits} cases per week`)
    .join(", ")}`;

  return (
    <AppShell>
      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="pos-title">
          <div>
            <p className="eyebrow">POS integration</p>
            <h1 id="pos-title">POS data &amp; sales insights</h1>
            <p>
              Simulate a point-of-sale connection to turn {selectedCustomer.name}&apos;s sell-through
              into best sellers, slow movers, category trends, reorder needs, and recommendation
              opportunities.
            </p>
          </div>
          <label className="control">
            <span>Buyer account</span>
            <select
              aria-label="Buyer account"
              value={customerId}
              onChange={(event) => {
                setCustomerId(event.target.value);
                setConnected(false);
              }}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="pos-connect" aria-label="POS connection">
          <div className="pos-connect-status">
            <span className={`connection-dot ${connected ? "is-live" : "is-offline"}`} aria-hidden="true" />
            <div>
              <strong>POS status: {connected ? "Live (simulated)" : "Offline"}</strong>
              <p>
                {connected
                  ? `Streaming synthetic sell-through for ${selectedCustomer.name}.`
                  : "Connect a point-of-sale source to sync sell-through data."}
              </p>
            </div>
          </div>
          <button
            className="submit-order-button pos-connect-button"
            type="button"
            onClick={() => setConnected((previous) => !previous)}
          >
            <PlugZap aria-hidden="true" size={17} />
            {connected ? "Disconnect POS" : "Connect POS"}
          </button>
          <p className="pos-integration-note">
            Demo only. Production integrations could connect through Shopify, Square, Lightspeed, or
            other POS APIs.
          </p>
        </section>

        {connected ? (
          <div className="dashboard-grid">
            <section className="dashboard-panel" aria-label="Best sellers">
              <h2>
                <TrendingUp aria-hidden="true" size={18} />
                Best sellers
              </h2>
              <ul className="ranked-list">
                {insights.bestSellers.map((point) => (
                  <li key={point.productId}>
                    <span>{point.name}</span>
                    <span className="ranked-meta">
                      {point.category} · {point.weeklyUnits}/wk
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dashboard-panel" aria-label="Slow movers">
              <h2>
                <TrendingDown aria-hidden="true" size={18} />
                Slow movers
              </h2>
              <ul className="ranked-list">
                {insights.slowMovers.map((point) => (
                  <li key={point.productId}>
                    <span>{point.name}</span>
                    <span className="ranked-meta">
                      {point.category} · {point.weeklyUnits}/wk
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dashboard-panel" aria-label="Category trends">
              <h2>Category trends</h2>
              <div className="bar-chart bar-chart-horizontal" role="img" aria-label={categoryChartLabel}>
                {insights.categoryTrends.map((trend) => (
                  <div className="hbar-row" key={trend.category} aria-hidden="true">
                    <span className="hbar-label">{trend.category}</span>
                    <span className="hbar-track">
                      <span
                        className="hbar-fill"
                        style={{ width: `${Math.round((trend.weeklyUnits / maxCategoryUnits) * 100)}%` }}
                      />
                    </span>
                    <span className="hbar-value">{trend.weeklyUnits}/wk</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-panel" aria-label="Reorder needs">
              <h2>Reorder needs</h2>
              {insights.reorderNeeds.length === 0 ? (
                <p>Stock is comfortably above reorder points for all selling lines.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>On hand</th>
                      <th>Reorder pt</th>
                      <th>Velocity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.reorderNeeds.map((need) => (
                      <tr key={need.productId}>
                        <td>{need.name}</td>
                        <td>{need.onHand}</td>
                        <td>{need.reorderPoint}</td>
                        <td>{need.weeklyUnits}/wk</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section
              className="dashboard-panel ai-insights-panel"
              aria-label="Recommendation opportunities"
            >
              <h2>
                <Sparkles aria-hidden="true" size={18} />
                Recommendation opportunities
              </h2>
              <ul className="insight-list">
                {insights.recommendationOpportunities.map((opportunity) => (
                  <li key={opportunity.productId}>
                    <strong>{opportunity.name}</strong>
                    <span> — {opportunity.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <section className="empty-state" aria-label="POS not connected">
            <h2>No POS data synced yet</h2>
            <p>Connect a simulated POS source to reveal sales-aware insights for this buyer.</p>
          </section>
        )}
      </main>
    </AppShell>
  );
}
