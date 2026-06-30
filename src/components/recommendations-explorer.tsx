"use client";

import Link from "next/link";
import { ArrowRight, Brain, ScanSearch, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { buildRecommendations } from "@/lib/recommendations";
import { customers } from "@/lib/mock-data";
import { navigationItems } from "@/lib/navigation";

const signalLabels: Record<string, string> = {
  lexical: "Lexical fit",
  semantic: "Semantic fit",
  history: "Purchase history",
  pos: "POS best sellers",
  "similar-buyer": "Similar buyers",
};

export function RecommendationsExplorer() {
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const result = useMemo(() => buildRecommendations(customerId), [customerId]);

  const lexicalTop = result.lexicalMatches.slice(0, 6);
  const semanticTop = result.semanticMatches
    .filter((match) => match.semanticScore > 0)
    .slice(0, 6);
  const recommendationsTop = result.recommendations
    .filter((rec) => rec.score > 0)
    .slice(0, 6);

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
        <section className="dashboard-title-band" aria-labelledby="recs-title">
          <div>
            <p className="eyebrow">Hybrid search</p>
            <h1 id="recs-title">AI recommendations</h1>
            <p>
              A transparent hybrid pipeline for {result.customer.name}: lexical category and keyword
              matching, semantic-style description similarity, and AI reranking grounded in purchase
              history, POS velocity, and similar-buyer signals.
            </p>
            <p className="recs-profile">
              Engaged categories: {result.profile.categories.join(", ") || "None yet"}
              {result.anchorProduct ? ` · Flagship: ${result.anchorProduct.name}` : ""}
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

        <div className="recs-pipeline">
          <section className="dashboard-panel" aria-label="Lexical keyword and category matching">
            <h2>
              <ScanSearch aria-hidden="true" size={18} />
              1 · Lexical matching
            </h2>
            <p className="stage-note">Keyword and category overlap with what the venue stocks.</p>
            <ul className="stage-list">
              {lexicalTop.map((match) => (
                <li key={match.productId}>
                  <span>{match.name}</span>
                  <span className="stage-tags">
                    {match.matchedOn.map((reason) => (
                      <span className="stage-tag" key={reason}>
                        {reason}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="dashboard-panel" aria-label="Semantic description similarity">
            <h2>
              <Brain aria-hidden="true" size={18} />
              2 · Semantic similarity
            </h2>
            <p className="stage-note">
              Description fit vs the flagship {result.anchorProduct?.name ?? "product"}.
            </p>
            <ul className="stage-list">
              {semanticTop.map((match) => (
                <li key={match.productId}>
                  <span>{match.name}</span>
                  <span className="stage-tags">
                    <span className="stage-tag">score {match.semanticScore}</span>
                    {match.sharedTerms.slice(0, 3).map((term) => (
                      <span className="stage-tag" key={term}>
                        {term}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="dashboard-panel ai-insights-panel recs-rerank"
            aria-label="AI reranked recommendations"
          >
            <h2>
              <Sparkles aria-hidden="true" size={18} />
              3 · AI reranking
            </h2>
            <p className="stage-note">Best-fit new products with grounded explanations.</p>
            <ul className="rec-card-list">
              {recommendationsTop.map((rec) => (
                <li className="rec-card" key={rec.productId}>
                  <div className="rec-card-head">
                    <strong>{rec.name}</strong>
                    <span className="rec-score">match {rec.score}</span>
                  </div>
                  <div className="stage-tags">
                    {rec.signals.map((signal) => (
                      <span className="stage-tag" key={signal}>
                        {signalLabels[signal] ?? signal}
                      </span>
                    ))}
                  </div>
                  <p className="rec-explanation">{rec.explanation}</p>
                  <Link className="rec-link" href="/catalogue">
                    View in catalogue
                    <ArrowRight aria-hidden="true" size={15} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
