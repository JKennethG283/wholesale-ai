import { buildBuyerInsights } from "@/lib/buyer-analytics";

describe("buyer analytics", () => {
  const insights = buildBuyerInsights("cust-bar-88");

  it("summarises previous orders newest first with monthly spend and rising trend", () => {
    expect(insights.previousOrders.map((order) => order.id)).toEqual([
      "ord-1003",
      "ord-1002",
      "ord-1001",
    ]);
    expect(insights.previousOrders[0].total).toBe(2874);

    expect(insights.monthlySpend).toEqual([
      { month: "2026-04", amount: 886 },
      { month: "2026-05", amount: 1512 },
      { month: "2026-06", amount: 2874 },
    ]);
    expect(insights.spendTrend.direction).toBe("up");
  });

  it("identifies the buyer's staple product by total cases purchased", () => {
    expect(insights.mostPurchasedProducts[0]).toEqual({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      totalCases: 42,
      totalSpend: 2184,
    });
  });

  it("derives reorder predictions from POS velocity and order history", () => {
    const bayline = insights.reorderPredictions.find(
      (prediction) => prediction.productId === "prod-bayline-pale",
    );

    expect(bayline).toMatchObject({
      reorderRisk: "High",
      estimatedStockRemaining: 6,
      predictedReorderDate: "2026-07-07",
      suggestedQuantity: 18,
    });
  });

  it("predicts the next order from products that need replenishment", () => {
    expect(insights.predictedNextOrder).toEqual({
      date: "2026-06-30",
      lineCount: 4,
      estimatedUnits: 66,
      estimatedTotal: 3728,
    });
  });

  it("exposes a POS sales chart series led by the fastest mover", () => {
    expect(insights.posSales).toHaveLength(5);
    expect(insights.posSales[0]).toEqual({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      weeklyUnits: 6,
    });
  });

  it("produces grounded AI insight statements about the buyer", () => {
    expect(insights.aiInsights.length).toBeGreaterThan(0);
    expect(
      insights.aiInsights.some((insight) =>
        insight.includes("Bayline Session Pale Ale"),
      ),
    ).toBe(true);
  });
});
