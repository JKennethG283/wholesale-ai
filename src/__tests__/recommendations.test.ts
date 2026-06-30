import { buildRecommendations } from "@/lib/recommendations";

describe("AI recommendations hybrid search", () => {
  const result = buildRecommendations("cust-bar-88");

  it("lexically matches products by the buyer's engaged categories", () => {
    const matchedIds = result.lexicalMatches.map((match) => match.productId);

    expect(matchedIds).toContain("prod-cola-rtd");
    expect(matchedIds).not.toContain("prod-bar-mats");

    const cola = result.lexicalMatches.find(
      (match) => match.productId === "prod-cola-rtd",
    );
    expect(cola?.matchedOn).toContain("category:Ready-to-drink");
  });

  it("scores semantic-style description similarity against the buyer's flagship product", () => {
    const semanticScore = (productId: string) =>
      result.semanticMatches.find((match) => match.productId === productId)
        ?.semanticScore ?? 0;

    expect(semanticScore("prod-harbour-ipa")).toBeGreaterThan(
      semanticScore("prod-glassware"),
    );

    const harbour = result.semanticMatches.find(
      (match) => match.productId === "prod-harbour-ipa",
    );
    expect(harbour?.sharedTerms).toContain("carton");
  });

  it("reranks recommendations by combined signal strength and never repeats purchased stock", () => {
    const recommendedIds = result.recommendations.map((rec) => rec.productId);

    for (const purchasedId of result.profile.purchasedProductIds) {
      expect(recommendedIds).not.toContain(purchasedId);
    }

    const scores = result.recommendations.map((rec) => rec.score);
    const sortedDescending = [...scores].sort((a, b) => b - a);
    expect(scores).toEqual(sortedDescending);

    const rankOf = (productId: string) => recommendedIds.indexOf(productId);
    expect(rankOf("prod-zero-hop")).toBeGreaterThanOrEqual(0);
    expect(rankOf("prod-zero-hop")).toBeLessThan(rankOf("prod-glassware"));
  });

  it("explains each recommendation in venue-grounded, wholesale language", () => {
    const zeroHop = result.recommendations.find(
      (rec) => rec.productId === "prod-zero-hop",
    );

    expect(zeroHop?.explanation).toContain("Bar 88 Melbourne CBD");
    expect(zeroHop?.explanation).toContain("Ridgeway Clean Lager");
  });
});
