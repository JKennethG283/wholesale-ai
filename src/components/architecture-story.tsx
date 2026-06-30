import Link from "next/link";
import { Layers, Route, ShieldAlert, Sparkles } from "lucide-react";
import {
  architectureLayers,
  complianceDisclaimer,
  demoStorySteps,
} from "@/lib/navigation";
import { AppShell } from "@/components/app-shell";

export function ArchitectureStory() {
  return (
    <AppShell>
      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="architecture-title">
          <div>
            <p className="eyebrow">Architecture</p>
            <h1 id="architecture-title">Architecture</h1>
            <p>
              How LiquorOps AI fits together as one connected AI workflow system — from the frontend
              through the data model, AI layer, automation layer, and the production integrations a
              real deployment would target.
            </p>
          </div>
        </section>

        <div className="ai-insight" role="note" aria-label="AI insight">
          <Sparkles size={18} aria-hidden="true" />
          <p>
            This is an <strong>AI workflow system</strong>, not just an AI chatbot: recommendations,
            reorder prediction, support automation, email drafting, and reporting share one
            operating data set and trigger real automation events.
          </p>
        </div>

        <section className="admin-card" role="region" aria-label="Architecture layers">
          <div className="admin-report-head">
            <Layers size={18} aria-hidden="true" />
            <h2>System layers</h2>
          </div>
          <div className="architecture-layer-grid">
            {architectureLayers.map((layer) => (
              <article key={layer.name} className="architecture-layer-card">
                <h3>{layer.name}</h3>
                <p>{layer.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-card" role="region" aria-label="End-to-end demo story">
          <div className="admin-report-head">
            <Route size={18} aria-hidden="true" />
            <h2>End-to-end demo path</h2>
          </div>
          <ol className="demo-steps">
            {demoStorySteps.map((item, index) => (
              <li key={item.step}>
                <span className="demo-step-index">{index + 1}</span>
                <span>
                  <strong>{item.step}</strong>
                  <span className="demo-step-detail">{item.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="demo-path-links">
            Follow it live: <Link href="/catalogue">Catalogue</Link> →{" "}
            <Link href="/cart">Cart / Order</Link> →{" "}
            <Link href="/workflow-log">Workflow Log</Link> →{" "}
            <Link href="/admin">Admin Dashboard</Link>
          </p>
        </section>

        <div className="compliance-note" role="note" aria-label="Compliance disclaimer">
          <ShieldAlert size={18} aria-hidden="true" />
          <p>{complianceDisclaimer}</p>
        </div>
      </main>
    </AppShell>
  );
}
