import {
  customers,
  inventory,
  orders,
  posSales,
  products,
  supportTickets,
} from "@/lib/mock-data";
import { dashboardAsOfDate } from "@/lib/buyer-analytics";

export type TopBuyer = {
  customerId: string;
  name: string;
  region: string;
  totalSpend: number;
  orderCount: number;
};

export type TopProduct = {
  productId: string;
  name: string;
  category: string;
  revenue: number;
  unitsSold: number;
};

export type RegionSales = {
  region: string;
  revenue: number;
};

export type CategorySales = {
  category: string;
  revenue: number;
};

export type DemandTrend = "up" | "down" | "flat";

export type DemandForecast = {
  productId: string;
  name: string;
  category: string;
  baseWeeklyUnits: number;
  predictedWeeklyUnits: number;
  trend: DemandTrend;
};

export type StockRiskLevel = "Low" | "Medium" | "High";

export type StockRisk = {
  productId: string;
  name: string;
  category: string;
  onHand: number;
  reorderPoint: number;
  predictedWeeklyUnits: number;
  weeksOfCover: number | null;
  risk: StockRiskLevel;
};

export type CustomerIssue = {
  ticketId: string;
  customerName: string;
  type: string;
  priority: string;
  status: string;
};

export type AdminDashboard = {
  topBuyers: TopBuyer[];
  topProducts: TopProduct[];
  salesByRegion: RegionSales[];
  salesByCategory: CategorySales[];
  predictedDemand: DemandForecast[];
  stockRisk: StockRisk[];
  customerIssues: CustomerIssue[];
};

const riskRank: Record<StockRiskLevel, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const trendFactors: Record<DemandTrend, number> = {
  up: 1.2,
  flat: 1,
  down: 0.8,
};

const winterSeasonFactors: Record<string, number> = {
  Beer: 1,
  Cider: 0.8,
  Wine: 1.1,
  Spirits: 1.1,
  "Ready-to-drink": 0.9,
  Mixers: 1,
  "Non-Alcoholic Drinks": 1,
  "Premium / Imported": 1.1,
  Barware: 1,
  Snacks: 1,
  "New Arrivals": 1.1,
};

function customerById(customerId: string) {
  return customers.find((customer) => customer.id === customerId);
}

function productById(productId: string) {
  return products.find((product) => product.id === productId);
}

function buildTopBuyers(): TopBuyer[] {
  const totals = new Map<string, { totalSpend: number; orderCount: number }>();
  for (const order of orders) {
    const current = totals.get(order.customerId) ?? { totalSpend: 0, orderCount: 0 };
    current.totalSpend += order.total;
    current.orderCount += 1;
    totals.set(order.customerId, current);
  }

  return Array.from(totals.entries())
    .map(([customerId, value]) => {
      const customer = customerById(customerId);
      return {
        customerId,
        name: customer?.name ?? customerId,
        region: customer?.region ?? "Unknown",
        totalSpend: value.totalSpend,
        orderCount: value.orderCount,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

function buildTopProducts(): TopProduct[] {
  const totals = new Map<string, { revenue: number; unitsSold: number }>();
  for (const order of orders) {
    for (const line of order.lines) {
      const current = totals.get(line.productId) ?? { revenue: 0, unitsSold: 0 };
      current.revenue += line.quantity * line.unitPrice;
      current.unitsSold += line.quantity;
      totals.set(line.productId, current);
    }
  }

  return Array.from(totals.entries())
    .map(([productId, value]) => {
      const product = productById(productId);
      return {
        productId,
        name: product?.name ?? productId,
        category: product?.category ?? "Unknown",
        revenue: value.revenue,
        unitsSold: value.unitsSold,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function buildSalesByRegion(): RegionSales[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    const region = customerById(order.customerId)?.region ?? "Unknown";
    totals.set(region, (totals.get(region) ?? 0) + order.total);
  }

  return Array.from(totals.entries())
    .map(([region, revenue]) => ({ region, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

function buildSalesByCategory(): CategorySales[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    for (const line of order.lines) {
      const category = productById(line.productId)?.category ?? "Unknown";
      totals.set(category, (totals.get(category) ?? 0) + line.quantity * line.unitPrice);
    }
  }

  return Array.from(totals.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

function baseWeeklyUnits(productId: string): number {
  return posSales
    .filter((entry) => entry.productId === productId)
    .reduce((sum, entry) => sum + entry.weeklyUnits, 0);
}

function productTrend(productId: string): DemandTrend {
  const quantities = orders
    .filter((order) => order.lines.some((line) => line.productId === productId))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((order) =>
      order.lines
        .filter((line) => line.productId === productId)
        .reduce((sum, line) => sum + line.quantity, 0),
    );

  if (quantities.length < 2) {
    return "flat";
  }

  const first = quantities[0];
  const last = quantities[quantities.length - 1];
  if (last > first) {
    return "up";
  }
  if (last < first) {
    return "down";
  }
  return "flat";
}

function isWinterMonth(asOfDate: Date): boolean {
  const month = asOfDate.getMonth();
  return month >= 5 && month <= 7;
}

function seasonFactor(category: string, asOfDate: Date): number {
  if (!isWinterMonth(asOfDate)) {
    return 1;
  }
  return winterSeasonFactors[category] ?? 1;
}

export function forecastDemand(asOfDate: Date = dashboardAsOfDate): DemandForecast[] {
  const productIds = new Set(posSales.map((entry) => entry.productId));

  return Array.from(productIds)
    .flatMap((productId) => {
      const product = productById(productId);
      if (!product) {
        return [];
      }

      const base = baseWeeklyUnits(productId);
      const trend = productTrend(productId);
      const predictedWeeklyUnits = Math.round(
        base * trendFactors[trend] * seasonFactor(product.category, asOfDate),
      );

      return [
        {
          productId,
          name: product.name,
          category: product.category,
          baseWeeklyUnits: base,
          predictedWeeklyUnits,
          trend,
        },
      ];
    })
    .sort((a, b) => b.predictedWeeklyUnits - a.predictedWeeklyUnits);
}

export function assessStockRisk(asOfDate: Date = dashboardAsOfDate): StockRisk[] {
  const demandByProduct = new Map(
    forecastDemand(asOfDate).map((row) => [row.productId, row.predictedWeeklyUnits]),
  );

  return inventory
    .flatMap((entry) => {
      const product = productById(entry.productId);
      if (!product) {
        return [];
      }

      const predictedWeeklyUnits = demandByProduct.get(entry.productId) ?? 0;
      const weeksOfCover =
        predictedWeeklyUnits > 0
          ? Math.round((entry.onHand / predictedWeeklyUnits) * 10) / 10
          : null;

      let risk: StockRiskLevel = "Low";
      if (entry.onHand === 0 || entry.onHand <= entry.reorderPoint * 0.5) {
        risk = "High";
      } else if (entry.onHand <= entry.reorderPoint) {
        risk = "Medium";
      }

      if (risk === "Low") {
        return [];
      }

      return [
        {
          productId: entry.productId,
          name: product.name,
          category: product.category,
          onHand: entry.onHand,
          reorderPoint: entry.reorderPoint,
          predictedWeeklyUnits,
          weeksOfCover,
          risk,
        },
      ];
    })
    .sort((a, b) => riskRank[a.risk] - riskRank[b.risk] || a.onHand - b.onHand);
}

function buildCustomerIssues(): CustomerIssue[] {
  const openFirst = supportTickets
    .slice()
    .sort((a, b) => Number(a.status !== "Open") - Number(b.status !== "Open"));

  return openFirst.map((ticket) => ({
    ticketId: ticket.id,
    customerName: customerById(ticket.customerId)?.name ?? ticket.customerId,
    type: ticket.type,
    priority: ticket.priority,
    status: ticket.status,
  }));
}

export function buildAdminDashboard(): AdminDashboard {
  return {
    topBuyers: buildTopBuyers(),
    topProducts: buildTopProducts(),
    salesByRegion: buildSalesByRegion(),
    salesByCategory: buildSalesByCategory(),
    predictedDemand: forecastDemand(),
    stockRisk: assessStockRisk(),
    customerIssues: buildCustomerIssues(),
  };
}
