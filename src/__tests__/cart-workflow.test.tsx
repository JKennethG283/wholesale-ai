import { fireEvent, render, screen, within } from "@testing-library/react";
import CartPage from "@/app/cart/page";
import CataloguePage from "@/app/catalogue/page";

describe("cart and order workflow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("lets a buyer add catalogue products, validate totals, submit, and see workflow outputs", async () => {
    render(<CataloguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /Add Bayline Session Pale Ale to cart/i }),
    );

    expect(
      screen.getByText("Bayline Session Pale Ale added to cart."),
    ).toBeInTheDocument();

    render(<CartPage />);

    const cartLine = await screen.findByRole("group", {
      name: /Bayline Session Pale Ale cart item/i,
    });

    fireEvent.change(
      within(cartLine).getByLabelText("Quantity for Bayline Session Pale Ale"),
      { target: { value: "200" } },
    );

    expect(screen.getByText("Exceeds available stock by 16 cases.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit mock order/i })).toBeDisabled();

    fireEvent.change(
      within(cartLine).getByLabelText("Quantity for Bayline Session Pale Ale"),
      { target: { value: "12" } },
    );
    fireEvent.change(screen.getByLabelText("Delivery region"), {
      target: { value: "Regional Victoria" },
    });

    expect(screen.getByText("$624.00")).toBeInTheDocument();
    expect(screen.getByText("-$60.00")).toBeInTheDocument();
    expect(screen.getByText("$34.00")).toBeInTheDocument();
    expect(screen.getByText("$95.00")).toBeInTheDocument();
    expect(screen.getByText("$693.00")).toBeInTheDocument();
    expect(screen.getByText("2026-07-07")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Submit mock order/i }));

    expect(
      screen.getByText("n8n workflow triggered for order ORD-MOCK-1002."),
    ).toBeInTheDocument();
    expect(screen.getByText("Order confirmation for Bar 88 Melbourne CBD")).toBeInTheDocument();
    expect(screen.getByText("Order confirmation created")).toBeInTheDocument();
    expect(screen.getByText("Stock quantity updated")).toBeInTheDocument();
    expect(screen.getByText("Confirmation email draft created")).toBeInTheDocument();
    expect(screen.getByText("n8n webhook trigger queued")).toBeInTheDocument();
    expect(screen.getByText(/172 cases remaining/i)).toBeInTheDocument();
  });

  it("lets a buyer remove a cart item", async () => {
    render(<CataloguePage />);

    fireEvent.click(
      screen.getByRole("button", { name: /Add Ridgeway Clean Lager to cart/i }),
    );

    render(<CartPage />);

    const cartLine = await screen.findByRole("group", {
      name: /Ridgeway Clean Lager cart item/i,
    });

    fireEvent.click(
      within(cartLine).getByRole("button", {
        name: /Remove Ridgeway Clean Lager from cart/i,
      }),
    );

    expect(screen.getByRole("heading", { name: /No products in cart/i })).toBeInTheDocument();
  });
});
