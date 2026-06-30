import { inventory, posSales, products } from "@/lib/mock-data";

export type PosSalesPoint = {
  productId: string;
  name: string;
  category: string;
  weeklyUnits: number;
};

export type CategoryTrend = {
  category: string;
  weeklyUnits: number;
  productCount: number;
};

export type PosReorderNeed = {
  productId: string;
  name: string;
  onHand: number;
  reorderPoint: number;
  weeklyUnits: number;
};

export type PosRecommendation = {
  productId: string;
  name: string;
  category: string;
  reason: string;
};

export type PosInsights = {
  bestSellers: PosSalesPoint[];
  slowMovers: PosSalesPoint[];
  categoryTrends: CategoryTrend[];
  reorderNeeds: PosReorderNeed[];
  recommendationOpportunities: PosRecommendation[];
};

function productById(productId: string) {
  return products.find((product) => product.id === productId);
}

function inventoryById(productId: string) {
  return inventory.find((entry) => entry.productId === productId);
}

export function buildPosInsights(customerId: string): PosInsights {
  const salesData: PosSalesPoint[] = posSales
    .filter((entry) => entry.customerId === customerId)
    .flatMap((entry) => {
      const product = productById(entry.productId);

      if (!product) {
        return [];
      }

      return [
        {
          productId: entry.productId,
          name: product.name,
          category: product.category,
          weeklyUnits: entry.weeklyUnits,
        },
      ];
    });

  const rankedBySales = salesData.slice().sort((a, b) => b.weeklyUnits - a.weeklyUnits);
  const rankedBySlowest = salesData.slice().sort((a, b) => a.weeklyUnits - b.weeklyUnits);

  const categoryTotals = new Map<string, { weeklyUnits: number; productCount: number }>();
  for (const point of salesData) {
    const current = categoryTotals.get(point.category) ?? { weeklyUnits: 0, productCount: 0 };
    current.weeklyUnits += point.weeklyUnits;
    current.productCount += 1;
    categoryTotals.set(point.category, current);
  }
  const categoryTrends: CategoryTrend[] = Array.from(categoryTotals.entries())
    .map(([category, totals]) => ({ category, ...totals }))
    .sort((a, b) => b.weeklyUnits - a.weeklyUnits);

  const reorderNeeds: PosReorderNeed[] = salesData.flatMap((point) => {
    const stock = inventoryById(point.productId);

    if (!stock || stock.onHand > stock.reorderPoint) {
      return [];
    }

    return [
      {
        productId: point.productId,
        name: point.name,
        onHand: stock.onHand,
        reorderPoint: stock.reorderPoint,
        weeklyUnits: point.weeklyUnits,
      },
    ];
  });

  const soldProductIds = new Set(salesData.map((point) => point.productId));
  const recommendationOpportunities: PosRecommendation[] = [];
  const recommendedIds = new Set<string>();
  for (const point of rankedBySales) {
    const sourceProduct = productById(point.productId);

    for (const similarId of sourceProduct?.similarProductIds ?? []) {
      if (soldProductIds.has(similarId) || recommendedIds.has(similarId)) {
        continue;
      }

      const similarProduct = productById(similarId);
      if (!similarProduct) {
        continue;
      }

      recommendedIds.add(similarId);
      recommendationOpportunities.push({
        productId: similarId,
        name: similarProduct.name,
        category: similarProduct.category,
        reason: `Pairs with strong ${point.name} sales`,
      });
    }
  }

  return {
    bestSellers: rankedBySales.slice(0, 3),
    slowMovers: rankedBySlowest.slice(0, 2),
    categoryTrends,
    reorderNeeds,
    recommendationOpportunities,
  };
}
