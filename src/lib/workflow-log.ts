import { customers, orders, products, supportTickets } from "@/lib/mock-data";
import { dashboardAsOfDate } from "@/lib/buyer-analytics";
import { assessStockRisk } from "@/lib/admin-analytics";
import { buildWeeklyReport } from "@/lib/weekly-report";

export type WorkflowEventType =
  | "order-confirmation"
  | "stock-update"
  | "email-draft"
  | "support-ticket"
  | "n8n-webhook"
  | "reorder-recommendation"
  | "weekly-report";

export type WorkflowStatus = "Complete" | "Queued" | "Triggered";

export type WorkflowLogEntry = {
  id: string;
  type: WorkflowEventType;
  status: WorkflowStatus;
  timing: string;
  summary: string;
  customerName?: string;
  productName?: string;
};

function customerName(customerId: string): string {
  return customers.find((customer) => customer.id === customerId)?.name ?? customerId;
}

function productName(productId: string): string {
  return products.find((product) => product.id === productId)?.name ?? productId;
}

function relativeTiming(dateStr: string, asOf: Date = dashboardAsOfDate): string {
  const date = new Date(`${dateStr}T10:00:00+10:00`);
  const days = Math.round((asOf.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return "Today";
  }
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
}

export function buildWorkflowLog(): WorkflowLogEntry[] {
  const recentOrders = orders.slice().sort((a, b) => b.date.localeCompare(a.date));

  const orderEvents: WorkflowLogEntry[] = recentOrders.flatMap((order) => {
    const buyer = customerName(order.customerId);
    const leadProduct = productName(order.lines[0].productId);
    const cases = order.lines.reduce((sum, line) => sum + line.quantity, 0);

    return [
      {
        id: `wf-${order.id}-confirmation`,
        type: "order-confirmation",
        status: "Complete",
        timing: relativeTiming(order.date),
        summary: `Order ${order.id} confirmed for ${buyer} ($${order.total.toLocaleString()}).`,
        customerName: buyer,
        productName: leadProduct,
      },
      {
        id: `wf-${order.id}-stock`,
        type: "stock-update",
        status: "Complete",
        timing: relativeTiming(order.date),
        summary: `Stock decremented by ${cases} cases across ${order.lines.length} line(s), led by ${leadProduct}.`,
        customerName: buyer,
        productName: leadProduct,
      },
      {
        id: `wf-${order.id}-email`,
        type: "email-draft",
        status: "Complete",
        timing: relativeTiming(order.date),
        summary: `Confirmation email draft created for ${buyer}.`,
        customerName: buyer,
        productName: leadProduct,
      },
    ];
  });

  const supportEvents: WorkflowLogEntry[] = supportTickets.flatMap((ticket) => {
    const buyer = customerName(ticket.customerId);
    return [
      {
        id: `wf-${ticket.id}-ticket`,
        type: "support-ticket",
        status: "Complete",
        timing: "Today",
        summary: `${ticket.priority}-priority ${ticket.type} ticket ${ticket.id} created for ${buyer}.`,
        customerName: buyer,
      },
      {
        id: `wf-${ticket.id}-webhook`,
        type: "n8n-webhook",
        status: "Triggered",
        timing: "Today",
        summary: `n8n webhook fired to route ${ticket.type.toLowerCase()} ticket ${ticket.id} to the support team.`,
        customerName: buyer,
      },
    ];
  });

  const reorderEvents: WorkflowLogEntry[] = assessStockRisk()
    .filter((item) => item.risk === "High")
    .slice(0, 3)
    .map((item) => ({
      id: `wf-reorder-${item.productId}`,
      type: "reorder-recommendation",
      status: "Queued",
      timing: "Today",
      summary: `AI recommended reordering ${item.name} (${item.onHand} on hand vs reorder point ${item.reorderPoint}).`,
      productName: item.name,
    }));

  const report = buildWeeklyReport();
  const reportEvent: WorkflowLogEntry = {
    id: "wf-weekly-report",
    type: "weekly-report",
    status: "Complete",
    timing: "Today",
    summary: `${report.title} generated with ${report.sections.length} sections of recommended actions.`,
  };

  const all = [...orderEvents, ...supportEvents, ...reorderEvents, reportEvent];
  return all.sort((a, b) => timingRank(a.timing) - timingRank(b.timing));
}

function timingRank(timing: string): number {
  if (timing === "Today") {
    return 0;
  }
  const match = timing.match(/^(\d+) day/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}
