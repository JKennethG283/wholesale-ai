import { predictReorder } from "@/lib/reorder";

describe("reorder prediction", () => {
  it("flags high reorder risk when projected usage has nearly drained the last order", () => {
    const prediction = predictReorder({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      avgWeeklySales: 6,
      daysSinceLastOrder: 21,
      lastOrderQuantity: 24,
      asOfDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(prediction.estimatedStockRemaining).toBe(6);
    expect(prediction.reorderRisk).toBe("High");
  });

  it("predicts the reorder date from remaining days of cover at current sales velocity", () => {
    const prediction = predictReorder({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      avgWeeklySales: 6,
      daysSinceLastOrder: 21,
      lastOrderQuantity: 24,
      asOfDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(prediction.predictedReorderDate).toBe("2026-07-07");
  });

  it("suggests a quantity that tops the buyer back up to four weeks of cover", () => {
    const prediction = predictReorder({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      avgWeeklySales: 6,
      daysSinceLastOrder: 21,
      lastOrderQuantity: 24,
      asOfDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(prediction.suggestedQuantity).toBe(18);
  });

  it("suggests no reorder when stock still comfortably covers demand", () => {
    const prediction = predictReorder({
      productId: "prod-tonic",
      name: "Botanical Dry Tonic 24 Pack",
      avgWeeklySales: 2,
      daysSinceLastOrder: 3,
      lastOrderQuantity: 30,
      asOfDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(prediction.reorderRisk).toBe("Low");
    expect(prediction.suggestedQuantity).toBe(0);
  });
});
