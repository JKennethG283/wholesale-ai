import {
  Boxes,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  Sparkles,
  Ticket,
  Webhook,
} from "lucide-react";
import {
  buildWorkflowLog,
  type WorkflowEventType,
  type WorkflowStatus,
} from "@/lib/workflow-log";
import { AppShell } from "@/components/app-shell";

const typeLabel: Record<WorkflowEventType, string> = {
  "order-confirmation": "Order confirmation",
  "stock-update": "Stock update",
  "email-draft": "Email draft",
  "support-ticket": "Support ticket",
  "n8n-webhook": "n8n webhook",
  "reorder-recommendation": "Reorder recommendation",
  "weekly-report": "Weekly report",
};

const typeIcon: Record<WorkflowEventType, typeof Boxes> = {
  "order-confirmation": CheckCircle2,
  "stock-update": Boxes,
  "email-draft": Mail,
  "support-ticket": Ticket,
  "n8n-webhook": Webhook,
  "reorder-recommendation": RefreshCw,
  "weekly-report": Sparkles,
};

const statusClass: Record<WorkflowStatus, string> = {
  Complete: "priority-low",
  Queued: "priority-medium",
  Triggered: "priority-medium",
};

export function WorkflowLogView() {
  const log = buildWorkflowLog();

  return (
    <AppShell>
      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="workflow-title">
          <div>
            <p className="eyebrow">Workflow log</p>
            <h1 id="workflow-title">Workflow Log</h1>
            <p>
              Every automation event across LiquorOps AI — order confirmations, stock updates, email
              drafts, support tickets, n8n webhooks, reorder recommendations, and weekly reporting —
              in one connected trail.
            </p>
          </div>
        </section>

        <div className="ai-insight" role="note" aria-label="AI insight">
          <Sparkles size={18} aria-hidden="true" />
          <p>
            LiquorOps AI is an <strong>AI workflow system</strong>, not just a chatbot: ordering,
            stock, recommendations, support, email drafting, and reporting all trigger connected
            automations you can trace here.
          </p>
        </div>

        <section className="admin-card workflow-log-card" role="region" aria-label="Automation log">
          <h2>Automation log</h2>
          <ol className="workflow-feed">
            {log.map((entry) => {
              const Icon = typeIcon[entry.type];
              return (
                <li key={entry.id} className="workflow-feed-item">
                  <span className="workflow-feed-icon" aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <div className="workflow-feed-body">
                    <div className="workflow-feed-head">
                      <strong>{typeLabel[entry.type]}</strong>
                      <span className={`priority-badge ${statusClass[entry.status]}`}>
                        {entry.status}
                      </span>
                      <span className="workflow-feed-time">
                        <Clock size={13} aria-hidden="true" /> {entry.timing}
                      </span>
                    </div>
                    <p>{entry.summary}</p>
                    {entry.customerName || entry.productName ? (
                      <p className="workflow-feed-meta">
                        {[entry.customerName, entry.productName].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </AppShell>
  );
}
