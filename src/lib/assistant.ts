import { buildBuyerInsights } from "@/lib/buyer-analytics";
import { buildRecommendations } from "@/lib/recommendations";
import { getStockStatus } from "@/lib/catalogue";
import { customers, posSales, products, supportTickets } from "@/lib/mock-data";

const stockRiskThreshold = 40;

const melbourneRegion = "Melbourne CBD";

const suggestedResponses: Record<string, string> = {
  Delivery:
    "Apologise for the delivery delay, confirm the revised delivery window, and offer priority dispatch on the next order.",
  Billing:
    "Acknowledge the billing query, confirm the corrected invoice total, and send an updated statement.",
  Product:
    "Thank them for the product feedback, confirm replacement or credit, and flag the batch for quality review.",
};

function productById(productId: string) {
  return products.find((product) => product.id === productId);
}

function customerName(customerId: string) {
  return customers.find((customer) => customer.id === customerId)?.name ?? customerId;
}

export type AssistantPrompt = {
  id: string;
  text: string;
};

export const assistantPrompts: AssistantPrompt[] = [
  { id: "reorder", text: "Which products should this venue reorder?" },
  { id: "top-melbourne", text: "What are the top-selling products in Melbourne?" },
  { id: "restock-customers", text: "Which customers are likely to need restocking soon?" },
  {
    id: "email-draft",
    text: "Draft a personalised email recommending new products to this buyer.",
  },
  { id: "support-summary", text: "Summarise this customer issue and suggest a response." },
  { id: "stock-risk", text: "Which products are at risk of running out next week?" },
];

export type AssistantResponse = {
  promptId: string;
  headline: string;
  body: string[];
};

function answerReorder(customerId: string): AssistantResponse {
  const insights = buildBuyerInsights(customerId);
  const highRisk = insights.reorderPredictions.filter(
    (prediction) => prediction.reorderRisk === "High",
  );

  const body = highRisk.length
    ? highRisk.map(
        (prediction) =>
          `${prediction.name}: order ${prediction.suggestedQuantity} cases by ${prediction.predictedReorderDate} (${prediction.reorderRisk} reorder risk).`,
      )
    : ["No products are at high reorder risk for this venue right now."];

  return {
    promptId: "reorder",
    headline: `Reorder priorities for ${insights.customer.name}`,
    body,
  };
}

function answerTopMelbourne(): AssistantResponse {
  const melbourneCustomerIds = new Set<string>(
    customers
      .filter((customer) => customer.region === melbourneRegion)
      .map((customer) => customer.id),
  );

  const totals = new Map<string, number>();
  for (const entry of posSales) {
    if (!melbourneCustomerIds.has(entry.customerId)) {
      continue;
    }
    totals.set(entry.productId, (totals.get(entry.productId) ?? 0) + entry.weeklyUnits);
  }

  const ranked = Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const body = ranked.length
    ? ranked.map(([productId, weeklyUnits]) => {
        const product = productById(productId);
        return `${product?.name ?? productId} — ${weeklyUnits} cases/week (${product?.category ?? "Unknown"}).`;
      })
    : ["No POS sales are synced for Melbourne CBD venues yet."];

  return {
    promptId: "top-melbourne",
    headline: `Top-selling products across ${melbourneRegion}`,
    body,
  };
}

function answerRestockCustomers(): AssistantResponse {
  const atRisk = customers
    .map((customer) => {
      const insights = buildBuyerInsights(customer.id);
      const highRisk = insights.reorderPredictions.filter(
        (prediction) => prediction.reorderRisk === "High",
      );
      return { customer, highRisk };
    })
    .filter((entry) => entry.highRisk.length > 0)
    .sort((a, b) => b.highRisk.length - a.highRisk.length);

  const body = atRisk.length
    ? atRisk.map(
        (entry) =>
          `${entry.customer.name}: ${entry.highRisk.length} products at high reorder risk (e.g., ${entry.highRisk[0].name}).`,
      )
    : ["No customers are flagged for restocking right now."];

  return {
    promptId: "restock-customers",
    headline: "Customers likely to need restocking soon",
    body,
  };
}

function answerEmailDraft(customerId: string): AssistantResponse {
  const result = buildRecommendations(customerId);
  const picks = result.recommendations.filter((rec) => rec.score > 0).slice(0, 3);

  const body = [
    `Subject: New products picked for ${result.customer.name}`,
    `Hi ${result.customer.name} team,`,
    `Based on your recent orders and POS sales, we recommend a few new lines for your ${result.customer.segment.toLowerCase()}:`,
    ...picks.map((rec) => `- ${rec.name}: ${rec.explanation}`),
    "Happy to add any of these to your next order — just reply and we'll prepare it.",
    "Thanks, LiquorOps AI",
  ];

  return {
    promptId: "email-draft",
    headline: `Personalised recommendation email for ${result.customer.name}`,
    body,
  };
}

function answerSupportSummary(customerId: string): AssistantResponse {
  const ticket =
    supportTickets.find((entry) => entry.customerId === customerId) ??
    supportTickets.find((entry) => entry.status === "Open") ??
    supportTickets[0];

  if (!ticket) {
    return {
      promptId: "support-summary",
      headline: "No open support issues",
      body: ["There are no open support tickets to summarise right now."],
    };
  }

  const name = customerName(ticket.customerId);

  return {
    promptId: "support-summary",
    headline: `Support summary for ${name}`,
    body: [
      `Summary: ${ticket.priority}-priority ${ticket.type} issue (${ticket.id}) for ${name} is currently ${ticket.status}.`,
      `Suggested response: ${suggestedResponses[ticket.type] ?? "Acknowledge the issue, confirm next steps, and follow up once resolved."}`,
    ],
  };
}

function answerStockRisk(): AssistantResponse {
  const atRisk = products
    .filter((product) => product.stock < stockRiskThreshold)
    .slice()
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const body = atRisk.length
    ? atRisk.map((product) => {
        const status = getStockStatus(product.stock);
        return `${product.name}: ${product.stock} cases (${status.label}).`;
      })
    : ["No products are at risk of running out next week."];

  return {
    promptId: "stock-risk",
    headline: "Products at risk of running out next week",
    body,
  };
}

export function answerAssistantPrompt(
  promptId: string,
  customerId: string,
): AssistantResponse {
  switch (promptId) {
    case "reorder":
      return answerReorder(customerId);
    case "top-melbourne":
      return answerTopMelbourne();
    case "restock-customers":
      return answerRestockCustomers();
    case "email-draft":
      return answerEmailDraft(customerId);
    case "support-summary":
      return answerSupportSummary(customerId);
    case "stock-risk":
      return answerStockRisk();
    default:
      return {
        promptId,
        headline: "Unsupported request",
        body: ["This assistant prompt is not available yet."],
      };
  }
}
