import { buildAdminDashboard } from "@/lib/admin-analytics";
import { customers, orders } from "@/lib/mock-data";

type GrowingCustomer = {
  name: string;
  firstSpend: number;
  lastSpend: number;
};

function customerName(customerId: string): string {
  return customers.find((customer) => customer.id === customerId)?.name ?? customerId;
}

function findGrowingCustomers(): GrowingCustomer[] {
  const byCustomer = new Map<string, { date: string; total: number }[]>();
  for (const order of orders) {
    const list = byCustomer.get(order.customerId) ?? [];
    list.push({ date: order.date, total: order.total });
    byCustomer.set(order.customerId, list);
  }

  const growing: GrowingCustomer[] = [];
  for (const [customerId, history] of byCustomer) {
    const sorted = history.slice().sort((a, b) => a.date.localeCompare(b.date));
    const firstSpend = sorted[0].total;
    const lastSpend = sorted[sorted.length - 1].total;
    if (sorted.length >= 2 && lastSpend > firstSpend) {
      growing.push({ name: customerName(customerId), firstSpend, lastSpend });
    }
  }

  return growing.sort((a, b) => b.lastSpend - a.lastSpend);
}

export type WeeklyReportSection = {
  id: string;
  heading: string;
  points: string[];
};

export type WeeklyReport = {
  title: string;
  sections: WeeklyReportSection[];
};

export function buildWeeklyReport(): WeeklyReport {
  const dashboard = buildAdminDashboard();

  const topPerformers: WeeklyReportSection = {
    id: "top-performers",
    heading: "What sold well",
    points: dashboard.topProducts
      .slice(0, 3)
      .map(
        (product) =>
          `${product.name} led ${product.category} with $${product.revenue.toLocaleString()} in revenue (${product.unitsSold} cases).`,
      ),
  };

  const growingCustomers: WeeklyReportSection = {
    id: "growing-customers",
    heading: "Customers growing",
    points: findGrowingCustomers().map(
      (customer) =>
        `${customer.name} grew spend from $${customer.firstSpend.toLocaleString()} to $${customer.lastSpend.toLocaleString()} — prioritise for upsell.`,
    ),
  };

  const restock: WeeklyReportSection = {
    id: "restock",
    heading: "Restock priorities",
    points: dashboard.stockRisk
      .filter((item) => item.risk === "High")
      .slice(0, 4)
      .map(
        (item) =>
          `${item.name} is ${item.risk.toLowerCase()} risk (${item.onHand} on hand vs reorder point ${item.reorderPoint}).`,
      ),
  };

  const regions: WeeklyReportSection = {
    id: "regions",
    heading: "Regional trends",
    points: dashboard.salesByRegion
      .slice(0, 3)
      .map(
        (region) =>
          `${region.region} contributed $${region.revenue.toLocaleString()} in orders this period.`,
      ),
  };

  const upTrend = dashboard.predictedDemand.find((item) => item.trend === "up");
  const topGrower = findGrowingCustomers()[0];
  const promotionPoints: string[] = [];
  if (upTrend) {
    promotionPoints.push(
      `Run a featured promotion on ${upTrend.name} — predicted demand is trending up to ${upTrend.predictedWeeklyUnits} cases/week.`,
    );
  }
  if (topGrower) {
    promotionPoints.push(
      `Offer ${topGrower.name} a volume deal while their spend is climbing.`,
    );
  }
  promotionPoints.push(
    `Bundle ${dashboard.salesByCategory[0].category} best-sellers with mixers to lift basket size in ${dashboard.salesByRegion[0].region}.`,
  );

  const promotions: WeeklyReportSection = {
    id: "promotions",
    heading: "Recommended promotions",
    points: promotionPoints,
  };

  return {
    title: "Weekly business report",
    sections: [topPerformers, growingCustomers, restock, regions, promotions],
  };
}
