import { buildWeeklyReport } from "@/lib/weekly-report";

describe("weekly business report", () => {
  it("summarises what sold well", () => {
    const report = buildWeeklyReport();
    const section = report.sections.find((entry) => entry.id === "top-performers");

    expect(section?.points.join(" ")).toContain("Bayline Session Pale Ale");
  });

  it("identifies which customers are growing", () => {
    const report = buildWeeklyReport();
    const section = report.sections.find((entry) => entry.id === "growing-customers");

    expect(section?.points.join(" ")).toContain("Bar 88 Melbourne CBD");
  });

  it("flags which products may need restocking", () => {
    const report = buildWeeklyReport();
    const section = report.sections.find((entry) => entry.id === "restock");

    expect(section?.points.join(" ")).toContain("Meadowrun Pear Cider");
  });

  it("highlights which regions are trending", () => {
    const report = buildWeeklyReport();
    const section = report.sections.find((entry) => entry.id === "regions");

    expect(section?.points.join(" ")).toContain("Melbourne CBD");
  });

  it("recommends promotions the sales team should run", () => {
    const report = buildWeeklyReport();
    const section = report.sections.find((entry) => entry.id === "promotions");

    expect(section?.points.length ?? 0).toBeGreaterThan(0);
    expect(section?.points.join(" ")).toContain("Bayline Session Pale Ale");
  });
});
