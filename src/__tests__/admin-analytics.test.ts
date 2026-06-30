import {
  assessStockRisk,
  buildAdminDashboard,
  forecastDemand,
} from "@/lib/admin-analytics";

describe("admin dashboard aggregation", () => {
  it("ranks top buyers by total spend", () => {
    const dashboard = buildAdminDashboard();
    const top = dashboard.topBuyers[0];

    expect(top.name).toBe("Bar 88 Melbourne CBD");
    expect(top.totalSpend).toBe(5272);
    expect(top.orderCount).toBe(3);
  });

  it("ranks top-selling products by revenue", () => {
    const dashboard = buildAdminDashboard();
    const top = dashboard.topProducts[0];

    expect(top.name).toBe("Bayline Session Pale Ale");
    expect(top.revenue).toBe(2184);
    expect(top.unitsSold).toBe(42);
  });

  it("totals sales by region", () => {
    const dashboard = buildAdminDashboard();
    const top = dashboard.salesByRegion[0];
    const melbourne = dashboard.salesByRegion.find((row) => row.region === "Melbourne CBD");

    expect(top.region).toBe("Melbourne CBD");
    expect(melbourne?.revenue).toBe(5272);
  });

  it("totals sales by category", () => {
    const dashboard = buildAdminDashboard();
    const top = dashboard.salesByCategory[0];

    expect(top.category).toBe("Beer");
    expect(top.revenue).toBe(3336);
  });
});

describe("admin demand forecasting", () => {
  it("lifts predicted demand for a product trending up in order history", () => {
    const forecast = forecastDemand();
    const bayline = forecast.find((row) => row.productId === "prod-bayline-pale");

    expect(bayline?.baseWeeklyUnits).toBe(6);
    expect(bayline?.trend).toBe("up");
    expect(bayline?.predictedWeeklyUnits).toBe(7);
  });

  it("returns flat trend for products with a single order", () => {
    const forecast = forecastDemand();
    const harbour = forecast.find((row) => row.productId === "prod-harbour-ipa");

    expect(harbour?.trend).toBe("flat");
    expect(harbour?.predictedWeeklyUnits).toBe(3);
  });
});

describe("admin stock risk", () => {
  it("flags an out-of-stock product as high risk", () => {
    const risk = assessStockRisk();
    const pear = risk.find((row) => row.productId === "prod-pear-cider");

    expect(pear?.risk).toBe("High");
    expect(pear?.onHand).toBe(0);
  });

  it("flags a product below its reorder point as medium risk", () => {
    const risk = assessStockRisk();
    const gin = risk.find((row) => row.productId === "prod-juniper-gin");

    expect(gin?.risk).toBe("Medium");
  });

  it("excludes well-stocked products from the risk list", () => {
    const risk = assessStockRisk();

    expect(risk.find((row) => row.productId === "prod-bayline-pale")).toBeUndefined();
  });
});

describe("admin customer issues", () => {
  it("summarises open support tickets with customer names", () => {
    const dashboard = buildAdminDashboard();
    const issue = dashboard.customerIssues[0];

    expect(issue.customerName).toBe("Southbank Events Venue");
    expect(issue.type).toBe("Delivery");
    expect(issue.priority).toBe("Medium");
    expect(issue.status).toBe("Open");
  });
});
