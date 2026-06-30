import { render, screen, within } from "@testing-library/react";
import BuyerDashboardPage from "@/app/buyer-dashboard/page";

describe("buyer dashboard page", () => {
  it("renders key cards, charts, tables, and AI insight boxes from mock data", () => {
    render(<BuyerDashboardPage />);

    expect(
      screen.getByRole("heading", { name: /Buyer dashboard/i }),
    ).toBeInTheDocument();

    const previousOrders = screen.getByRole("region", { name: /previous orders/i });
    expect(within(previousOrders).getByText("ord-1003")).toBeInTheDocument();
    expect(within(previousOrders).getByText("$2,874")).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: /monthly spend trend/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /weekly POS sales/i }),
    ).toBeInTheDocument();

    const mostPurchased = screen.getByRole("region", {
      name: /most purchased products/i,
    });
    expect(
      within(mostPurchased).getByText("Bayline Session Pale Ale"),
    ).toBeInTheDocument();
    expect(within(mostPurchased).getByText(/42 cases/i)).toBeInTheDocument();

    const reorder = screen.getByRole("region", { name: /reorder suggestions/i });
    expect(within(reorder).getByText("2026-07-07")).toBeInTheDocument();
    expect(within(reorder).getByText(/18 cases/i)).toBeInTheDocument();

    const nextOrder = screen.getByRole("region", { name: /predicted next order/i });
    expect(within(nextOrder).getByText("$3,728")).toBeInTheDocument();

    const aiInsights = screen.getByRole("region", { name: /AI insights/i });
    expect(
      within(aiInsights).getByText(/Bayline Session Pale Ale/i),
    ).toBeInTheDocument();
  });
});
