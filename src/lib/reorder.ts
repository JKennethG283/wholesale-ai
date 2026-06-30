export type ReorderSignal = {
  productId: string;
  name: string;
  avgWeeklySales: number;
  daysSinceLastOrder: number;
  lastOrderQuantity: number;
  asOfDate: Date;
};

export type ReorderRisk = "Low" | "Medium" | "High";

export type ReorderPrediction = {
  productId: string;
  name: string;
  avgWeeklySales: number;
  estimatedStockRemaining: number;
  reorderRisk: ReorderRisk;
  predictedReorderDate: string;
  suggestedQuantity: number;
};

const targetCoverWeeks = 4;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function predictReorder(signal: ReorderSignal): ReorderPrediction {
  const dailySales = signal.avgWeeklySales / 7;
  const projectedUsage = dailySales * signal.daysSinceLastOrder;
  const estimatedStockRemaining = Math.max(
    0,
    Math.round(signal.lastOrderQuantity - projectedUsage),
  );

  const reorderRisk: ReorderRisk =
    estimatedStockRemaining <= signal.avgWeeklySales
      ? "High"
      : estimatedStockRemaining <= signal.avgWeeklySales * 2
        ? "Medium"
        : "Low";

  const daysOfCover =
    dailySales > 0 ? Math.round(estimatedStockRemaining / dailySales) : 0;

  const suggestedQuantity = Math.max(
    0,
    Math.ceil(signal.avgWeeklySales * targetCoverWeeks - estimatedStockRemaining),
  );

  return {
    productId: signal.productId,
    name: signal.name,
    avgWeeklySales: signal.avgWeeklySales,
    estimatedStockRemaining,
    reorderRisk,
    predictedReorderDate: addDays(signal.asOfDate, daysOfCover),
    suggestedQuantity,
  };
}
