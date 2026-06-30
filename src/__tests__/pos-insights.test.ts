import { buildPosInsights } from "@/lib/pos-insights";

describe("POS insights", () => {
  const insights = buildPosInsights("cust-bar-88");

  it("ranks best-selling products by weekly POS velocity", () => {
    expect(insights.bestSellers[0]).toEqual({
      productId: "prod-bayline-pale",
      name: "Bayline Session Pale Ale",
      category: "Beer",
      weeklyUnits: 6,
    });
  });

  it("surfaces slow-moving products from the lowest POS velocity", () => {
    expect(insights.slowMovers[0]).toEqual({
      productId: "prod-tonic",
      name: "Botanical Dry Tonic 24 Pack",
      category: "Mixers",
      weeklyUnits: 2,
    });
    expect(insights.slowMovers.map((point) => point.productId)).not.toContain(
      "prod-bayline-pale",
    );
  });

  it("aggregates category trends from POS velocity, led by the strongest category", () => {
    expect(insights.categoryTrends[0]).toEqual({
      category: "Beer",
      weeklyUnits: 13,
      productCount: 3,
    });
    expect(insights.categoryTrends).toContainEqual({
      category: "Mixers",
      weeklyUnits: 2,
      productCount: 1,
    });
  });

  it("flags reorder needs where selling stock has fallen to its reorder point", () => {
    expect(insights.reorderNeeds).toContainEqual({
      productId: "prod-harbour-ipa",
      name: "Harbour Yard Hazy IPA",
      onHand: 28,
      reorderPoint: 60,
      weeklyUnits: 3,
    });
    expect(insights.reorderNeeds.map((need) => need.productId)).not.toContain(
      "prod-bayline-pale",
    );
  });

  it("recommends products related to the buyer's sales that they are not already moving", () => {
    const soldProductIds = insights.bestSellers
      .concat(insights.slowMovers)
      .map((point) => point.productId);

    const vodka = insights.recommendationOpportunities.find(
      (opportunity) => opportunity.productId === "prod-vodka",
    );

    expect(vodka).toBeDefined();
    expect(vodka?.reason).toContain("North Pier Citrus Spritz Cans");

    for (const opportunity of insights.recommendationOpportunities) {
      expect(soldProductIds).not.toContain(opportunity.productId);
    }
  });
});
