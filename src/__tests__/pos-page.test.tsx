import { fireEvent, render, screen, within } from "@testing-library/react";
import PosPage from "@/app/pos/page";

describe("POS page", () => {
  it("notes production POS integrations regardless of connection state", () => {
    render(<PosPage />);

    expect(
      screen.getByText(/Shopify, Square, Lightspeed/i),
    ).toBeInTheDocument();
  });

  it("simulates a POS connection and reveals grounded sales insights", () => {
    render(<PosPage />);

    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: /best sellers/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Connect POS/i }));

    expect(screen.getByText(/Live \(simulated\)/i)).toBeInTheDocument();

    const bestSellers = screen.getByRole("region", { name: /best sellers/i });
    expect(
      within(bestSellers).getByText("Bayline Session Pale Ale"),
    ).toBeInTheDocument();

    const slowMovers = screen.getByRole("region", { name: /slow movers/i });
    expect(
      within(slowMovers).getByText("Botanical Dry Tonic 24 Pack"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: /category trends/i }),
    ).toBeInTheDocument();

    const reorderNeeds = screen.getByRole("region", { name: /reorder needs/i });
    expect(
      within(reorderNeeds).getByText("Harbour Yard Hazy IPA"),
    ).toBeInTheDocument();

    const recommendations = screen.getByRole("region", {
      name: /recommendation opportunities/i,
    });
    expect(
      within(recommendations).getByText("Northbank Triple Vodka"),
    ).toBeInTheDocument();
  });
});
