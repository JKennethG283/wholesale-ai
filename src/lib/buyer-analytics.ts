import { customers, orders, posSales, products } from "@/lib/mock-data";
import { predictReorder, type ReorderPrediction } from "@/lib/reorder";

export const dashboardAsOfDate = new Date("2026-06-30T10:00:00+10:00");

export type Customer = (typeof customers)[number];

export type PreviousOrderSummary = {
  id: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
};

export type MonthlySpend = { month: string; amount: number };

export type SpendTrend = {
  direction: "up" | "down" | "flat";
  changePct: number;
};

export type MostPurchasedProduct = {
  productId: string;
  name: string;
  totalCases: number;
  totalSpend: number;
};

export type PosSalesPoint = {
  productId: string;
  name: string;
  weeklyUnits: number;
};

export type PredictedNextOrder = {
  date: string;
  lineCount: number;
  estimatedUnits: number;
  estimatedTotal: number;
};

export type BuyerInsights = {
  customer: Customer;
  previousOrders: PreviousOrderSummary[];
  monthlySpend: MonthlySpend[];
  spendTrend: SpendTrend;
  mostPurchasedProducts: MostPurchasedProduct[];
  posSales: PosSalesPoint[];
  reorderPredictions: ReorderPrediction[];
  predictedNextOrder: PredictedNextOrder | null;
  aiInsights: string[];
};

const riskWeight: Record<ReorderPrediction["reorderRisk"], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function productName(productId: string) {
  return products.find((product) => product.id === productId)?.name ?? productId;
}

function productBasePrice(productId: string) {
  return products.find((product) => product.id === productId)?.basePrice ?? 0;
}

function daysSince(dateIso: string, asOfDate: Date) {
  const from = new Date(`${dateIso}T00:00:00Z`);
  const asOfUtc = Date.UTC(
    asOfDate.getUTCFullYear(),
    asOfDate.getUTCMonth(),
    asOfDate.getUTCDate(),
  );
  return Math.round((asOfUtc - from.getTime()) / 86_400_000);
}

export function buildBuyerInsights(
  customerId: string,
  asOfDate: Date = dashboardAsOfDate,
): BuyerInsights {
  const customer = customers.find((entry) => entry.id === customerId) ?? customers[0];

  const customerOrders = orders
    .filter((order) => order.customerId === customer.id)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const previousOrders: PreviousOrderSummary[] = customerOrders.map((order) => ({
    id: order.id,
    date: order.date,
    status: order.status,
    total: order.total,
    itemCount: order.lines.length,
  }));

  const monthlyTotals = new Map<string, number>();
  for (const order of customerOrders) {
    const month = order.date.slice(0, 7);
    monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + order.total);
  }
  const monthlySpend: MonthlySpend[] = Array.from(monthlyTotals.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const spendTrend = deriveSpendTrend(monthlySpend);

  const purchasedTotals = new Map<string, { cases: number; spend: number }>();
  for (const order of customerOrders) {
    for (const line of order.lines) {
      const current = purchasedTotals.get(line.productId) ?? { cases: 0, spend: 0 };
      current.cases += line.quantity;
      current.spend += line.quantity * line.unitPrice;
      purchasedTotals.set(line.productId, current);
    }
  }
  const mostPurchasedProducts: MostPurchasedProduct[] = Array.from(
    purchasedTotals.entries(),
  )
    .map(([productId, totals]) => ({
      productId,
      name: productName(productId),
      totalCases: totals.cases,
      totalSpend: totals.spend,
    }))
    .sort((a, b) => b.totalCases - a.totalCases);

  const customerPos = posSales.filter((entry) => entry.customerId === customer.id);
  const posSalesSeries: PosSalesPoint[] = customerPos
    .map((entry) => ({
      productId: entry.productId,
      name: productName(entry.productId),
      weeklyUnits: entry.weeklyUnits,
    }))
    .sort((a, b) => b.weeklyUnits - a.weeklyUnits);

  const reorderPredictions = buildReorderPredictions(customerOrders, customerPos, asOfDate);

  const predictedNextOrder = buildPredictedNextOrder(reorderPredictions);

  const aiInsights = buildAiInsights({
    customer,
    mostPurchasedProducts,
    reorderPredictions,
    spendTrend,
    predictedNextOrder,
  });

  return {
    customer,
    previousOrders,
    monthlySpend,
    spendTrend,
    mostPurchasedProducts,
    posSales: posSalesSeries,
    reorderPredictions,
    predictedNextOrder,
    aiInsights,
  };
}

function deriveSpendTrend(monthlySpend: MonthlySpend[]): SpendTrend {
  if (monthlySpend.length < 2) {
    return { direction: "flat", changePct: 0 };
  }

  const previous = monthlySpend[monthlySpend.length - 2].amount;
  const latest = monthlySpend[monthlySpend.length - 1].amount;
  const changePct = previous === 0 ? 0 : Math.round(((latest - previous) / previous) * 100);

  if (latest > previous) {
    return { direction: "up", changePct };
  }
  if (latest < previous) {
    return { direction: "down", changePct };
  }
  return { direction: "flat", changePct };
}

function buildReorderPredictions(
  customerOrders: ReadonlyArray<(typeof orders)[number]>,
  customerPos: ReadonlyArray<(typeof posSales)[number]>,
  asOfDate: Date,
): ReorderPrediction[] {
  return customerPos
    .map((pos) => {
      const latestOrderWithProduct = customerOrders.find((order) =>
        order.lines.some((line) => line.productId === pos.productId),
      );

      if (!latestOrderWithProduct) {
        return null;
      }

      const line = latestOrderWithProduct.lines.find(
        (candidate) => candidate.productId === pos.productId,
      );

      if (!line) {
        return null;
      }

      return predictReorder({
        productId: pos.productId,
        name: productName(pos.productId),
        avgWeeklySales: pos.weeklyUnits,
        daysSinceLastOrder: daysSince(latestOrderWithProduct.date, asOfDate),
        lastOrderQuantity: line.quantity,
        asOfDate,
      });
    })
    .filter((prediction): prediction is ReorderPrediction => prediction !== null)
    .sort(
      (a, b) =>
        riskWeight[a.reorderRisk] - riskWeight[b.reorderRisk] ||
        b.suggestedQuantity - a.suggestedQuantity,
    );
}

function buildPredictedNextOrder(
  reorderPredictions: ReorderPrediction[],
): PredictedNextOrder | null {
  const needed = reorderPredictions.filter((prediction) => prediction.suggestedQuantity > 0);

  if (needed.length === 0) {
    return null;
  }

  const estimatedUnits = needed.reduce((sum, prediction) => sum + prediction.suggestedQuantity, 0);
  const estimatedTotal = needed.reduce(
    (sum, prediction) =>
      sum + prediction.suggestedQuantity * productBasePrice(prediction.productId),
    0,
  );
  const date = needed
    .map((prediction) => prediction.predictedReorderDate)
    .sort((a, b) => a.localeCompare(b))[0];

  return {
    date,
    lineCount: needed.length,
    estimatedUnits,
    estimatedTotal,
  };
}

function buildAiInsights({
  customer,
  mostPurchasedProducts,
  reorderPredictions,
  spendTrend,
  predictedNextOrder,
}: {
  customer: Customer;
  mostPurchasedProducts: MostPurchasedProduct[];
  reorderPredictions: ReorderPrediction[];
  spendTrend: SpendTrend;
  predictedNextOrder: PredictedNextOrder | null;
}): string[] {
  const insights: string[] = [];
  const topProduct = mostPurchasedProducts[0];

  if (topProduct) {
    insights.push(
      `${customer.name} relies on ${topProduct.name} as a staple, with ${topProduct.totalCases} cases across recent orders.`,
    );
  }

  const highRisk = reorderPredictions.filter((prediction) => prediction.reorderRisk === "High");
  if (highRisk.length > 0 && predictedNextOrder) {
    insights.push(
      `${highRisk.length} ${highRisk.length === 1 ? "product is" : "products are"} at high reorder risk; suggested replenishment around ${predictedNextOrder.date} for an estimated $${predictedNextOrder.estimatedTotal}.`,
    );
  }

  insights.push(
    spendTrend.direction === "flat"
      ? `Monthly spend is holding steady for ${customer.name}.`
      : `Monthly spend is trending ${spendTrend.direction} (${Math.abs(spendTrend.changePct)}% vs the prior month).`,
  );

  return insights;
}
