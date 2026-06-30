"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Send,
  Ticket,
  Users,
} from "lucide-react";
import {
  automateSupportIssue,
  type SupportAutomationResult,
  type WorkflowEvent,
} from "@/lib/support-automation";
import { customers } from "@/lib/mock-data";
import { AppShell } from "@/components/app-shell";

const exampleIssue = "My delivery arrived late and two cases were missing.";

const priorityClass: Record<string, string> = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};

const workflowIcon: Record<WorkflowEvent["type"], typeof Ticket> = {
  summary: AlertTriangle,
  ticket: Ticket,
  notification: Users,
  email: Mail,
};

export function SupportAutomation() {
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const [issueText, setIssueText] = useState<string>("");
  const [result, setResult] = useState<SupportAutomationResult | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!issueText.trim()) {
      return;
    }
    setResult(automateSupportIssue(issueText, { customerId }));
  }

  return (
    <AppShell>
      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="support-title">
          <div>
            <p className="eyebrow">Support automation</p>
            <h1 id="support-title">Support Automation</h1>
            <p>
              Submit a real support issue and LiquorOps AI will classify it, prioritise it, route it
              to the right team, draft a customer response and email, and log the workflow — end to
              end.
            </p>
          </div>
          <label className="control">
            <span>Customer context</span>
            <select
              aria-label="Customer context"
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

        <form className="support-form" onSubmit={handleSubmit}>
          <label className="support-field">
            <span>Describe the support issue</span>
            <textarea
              aria-label="Describe the support issue"
              value={issueText}
              rows={4}
              placeholder={exampleIssue}
              onChange={(event) => setIssueText(event.target.value)}
            />
          </label>
          <div className="support-form-actions">
            <button
              type="button"
              className="support-example"
              onClick={() => setIssueText(exampleIssue)}
            >
              Use example
            </button>
            <button type="submit" className="support-submit">
              <Send size={16} aria-hidden="true" /> Run automation
            </button>
          </div>
        </form>

        {result ? (
          <div className="support-results">
            <section className="support-card" role="region" aria-label="Issue classification">
              <h2>Issue classification</h2>
              <div className="support-classification">
                <div>
                  <span className="support-meta-label">Issue type</span>
                  <strong className="support-issue-type">{result.issueType}</strong>
                </div>
                <div>
                  <span className="support-meta-label">Priority</span>
                  <span className={`priority-badge ${priorityClass[result.priority]}`}>
                    {result.priority}
                  </span>
                </div>
                <div>
                  <span className="support-meta-label">Suggested team</span>
                  <strong>{result.suggestedTeam}</strong>
                </div>
                <div>
                  <span className="support-meta-label">Ticket</span>
                  <strong>{result.ticketId}</strong>
                </div>
              </div>
              <p className="support-summary">{result.summary}</p>
              {result.themes.length > 1 ? (
                <p className="support-themes">
                  Detected themes: {result.themes.join(", ")}
                </p>
              ) : null}
            </section>

            <section className="support-card" role="region" aria-label="Suggested response">
              <h2>Suggested customer response</h2>
              <p>{result.suggestedResponse}</p>
            </section>

            <section className="support-card" role="region" aria-label="Email draft">
              <h2>Email draft</h2>
              <pre className="support-email">{result.emailDraft}</pre>
            </section>

            <section className="support-card" role="region" aria-label="Workflow log">
              <h2>Workflow log</h2>
              <ol className="support-workflow">
                {result.workflow.map((event, index) => {
                  const Icon = workflowIcon[event.type];
                  return (
                    <li key={`${event.type}-${index}`}>
                      <span className="support-workflow-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <span>
                        <strong>{event.label}</strong>
                        <span className="support-workflow-detail">{event.detail}</span>
                      </span>
                      <CheckCircle2
                        className="support-workflow-done"
                        size={16}
                        aria-hidden="true"
                      />
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        ) : (
          <p className="support-empty">
            Enter an issue above (or use the example) to see the automation run.
          </p>
        )}
      </main>
    </AppShell>
  );
}
