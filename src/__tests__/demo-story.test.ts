import { submitMockOrder } from "@/lib/cart";
import { buildWorkflowLog, type WorkflowEventType } from "@/lib/workflow-log";
import { buildAdminDashboard } from "@/lib/admin-analytics";
import { products } from "@/lib/mock-data";

describe("end-to-end demo story", () => {
  it("connects order submission to email, stock, workflow log, and admin impact", () => {
    const result = submitMockOrder({
      customerId: "cust-bar-88",
      customerName: "Bar 88 Melbourne CBD",
      items: [{ productId: "prod-bayline-pale", quantity: 6 }],
      products,
      region: "Melbourne CBD",
      orderDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(result.order.status).toBe("Submitted");
    expect(result.emailDraft.subject).toContain("Bar 88 Melbourne CBD");
    expect(result.inventoryUpdates[0].newStock).toBeLessThan(
      result.inventoryUpdates[0].previousStock,
    );
    expect(
      result.workflowLogs.some((entry) => entry.event.toLowerCase().includes("n8n")),
    ).toBe(true);

    const log = buildWorkflowLog();
    const types = new Set<WorkflowEventType>(log.map((entry) => entry.type));
    const expected: WorkflowEventType[] = [
      "order-confirmation",
      "stock-update",
      "email-draft",
      "support-ticket",
      "n8n-webhook",
      "reorder-recommendation",
      "weekly-report",
    ];
    for (const type of expected) {
      expect(types.has(type)).toBe(true);
    }

    const dashboard = buildAdminDashboard();
    expect(dashboard.topBuyers.length).toBeGreaterThan(0);
    expect(dashboard.stockRisk.length).toBeGreaterThan(0);
    expect(dashboard.predictedDemand.length).toBeGreaterThan(0);
  });
});
