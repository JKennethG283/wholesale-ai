import { buildWorkflowLog } from "@/lib/workflow-log";

describe("workflow log automation events", () => {
  it("logs order confirmation events grounded in real orders", () => {
    const log = buildWorkflowLog();
    const orderEvents = log.filter((entry) => entry.type === "order-confirmation");

    expect(orderEvents.length).toBeGreaterThan(0);
    expect(orderEvents.some((entry) => entry.customerName === "Bar 88 Melbourne CBD")).toBe(
      true,
    );
  });

  it("logs stock update events tied to a product", () => {
    const log = buildWorkflowLog();
    const stockEvents = log.filter((entry) => entry.type === "stock-update");

    expect(stockEvents.length).toBeGreaterThan(0);
    expect(stockEvents.every((entry) => Boolean(entry.productName))).toBe(true);
  });

  it("logs confirmation email draft events for the buyer", () => {
    const log = buildWorkflowLog();
    const emailEvents = log.filter((entry) => entry.type === "email-draft");

    expect(emailEvents.length).toBeGreaterThan(0);
    expect(emailEvents.every((entry) => Boolean(entry.customerName))).toBe(true);
    expect(emailEvents[0].summary.toLowerCase()).toContain("email");
  });

  it("logs support ticket events grounded in support data", () => {
    const log = buildWorkflowLog();
    const ticketEvents = log.filter((entry) => entry.type === "support-ticket");

    expect(ticketEvents.length).toBeGreaterThan(0);
    expect(ticketEvents[0].customerName).toBe("Southbank Events Venue");
    expect(ticketEvents[0].summary).toContain("Delivery");
  });

  it("logs n8n webhook trigger events", () => {
    const log = buildWorkflowLog();
    const webhookEvents = log.filter((entry) => entry.type === "n8n-webhook");

    expect(webhookEvents.length).toBeGreaterThan(0);
    expect(webhookEvents[0].status).toBe("Triggered");
  });

  it("logs reorder recommendation events for at-risk products", () => {
    const log = buildWorkflowLog();
    const reorderEvents = log.filter((entry) => entry.type === "reorder-recommendation");

    expect(reorderEvents.length).toBeGreaterThan(0);
    expect(reorderEvents.every((entry) => Boolean(entry.productName))).toBe(true);
  });

  it("logs the weekly report generation event", () => {
    const log = buildWorkflowLog();
    const reportEvents = log.filter((entry) => entry.type === "weekly-report");

    expect(reportEvents.length).toBe(1);
    expect(reportEvents[0].summary.toLowerCase()).toContain("weekly");
  });

  it("returns entries with required fields, all event types, most-recent first", () => {
    const log = buildWorkflowLog();

    for (const entry of log) {
      expect(entry.status).toBeTruthy();
      expect(entry.type).toBeTruthy();
      expect(entry.timing).toBeTruthy();
      expect(entry.summary).toBeTruthy();
    }

    const types = new Set(log.map((entry) => entry.type));
    expect(types.size).toBe(7);

    expect(log[0].timing).toBe("Today");
  });
});
