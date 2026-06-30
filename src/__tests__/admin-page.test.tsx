import { render, screen, within } from "@testing-library/react";
import AdminPage from "@/app/admin/page";

describe("Admin dashboard page", () => {
  it("renders key cards, charts, tables, badges, and the weekly report", () => {
    render(<AdminPage />);

    expect(
      screen.getByRole("heading", { name: /Admin Dashboard/i }),
    ).toBeInTheDocument();

    const buyers = screen.getByRole("region", { name: /top buyers/i });
    expect(within(buyers).getByText(/Bar 88 Melbourne CBD/)).toBeInTheDocument();

    const products = screen.getByRole("region", { name: /top-selling products/i });
    expect(
      within(products).getByText(/Bayline Session Pale Ale/),
    ).toBeInTheDocument();

    const regionSales = screen.getByRole("region", { name: /sales by region/i });
    expect(within(regionSales).getAllByText(/Melbourne CBD/).length).toBeGreaterThan(0);

    const categorySales = screen.getByRole("region", { name: /sales by category/i });
    expect(within(categorySales).getByText("Beer")).toBeInTheDocument();

    const demand = screen.getByRole("region", { name: /predicted demand/i });
    expect(within(demand).getAllByText(/Bayline Session Pale Ale/).length).toBeGreaterThan(0);

    const stockRisk = screen.getByRole("region", { name: /stock risk/i });
    expect(within(stockRisk).getByText(/Meadowrun Pear Cider/)).toBeInTheDocument();
    expect(within(stockRisk).getAllByText(/High/).length).toBeGreaterThan(0);

    const issues = screen.getByRole("region", { name: /customer issues/i });
    expect(within(issues).getByText(/Southbank Events Venue/)).toBeInTheDocument();

    const report = screen.getByRole("region", { name: /weekly business report/i });
    expect(within(report).getByText(/What sold well/i)).toBeInTheDocument();
    expect(within(report).getByText(/Recommended promotions/i)).toBeInTheDocument();
  });
});
