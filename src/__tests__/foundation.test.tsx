import { render, screen, within } from "@testing-library/react";
import HomePage from "@/app/page";
import { architectureLayers, navigationItems } from "@/lib/navigation";
import {
  catalogueCategories,
  customers,
  mockDataRegistry,
  regions,
} from "@/lib/mock-data";

describe("LiquorOps AI foundation shell", () => {
  it("presents the two entry roles and catalogue-first platform promise", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /LiquorOps AI/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "AI-powered wholesale ordering and automation for beverage distributors.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Buyer \/ venue owner/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Wholesaler admin/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/catalogue-first ordering/i)).toBeInTheDocument();
  });

  it("exposes navigation to every core prototype destination", () => {
    render(<HomePage />);

    const nav = screen.getByRole("navigation", { name: /primary/i });
    const expectedLabels = [
      "Catalogue",
      "Cart / Order",
      "Buyer Dashboard",
      "POS Data",
      "AI Recommendations",
      "AI Assistant",
      "Support Automation",
      "Admin Dashboard",
      "Workflow Log",
      "Architecture",
    ];

    expect(navigationItems.map((item) => item.label)).toEqual(expectedLabels);

    for (const label of expectedLabels) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("seeds the required synthetic customers, regions, categories, and data groups", () => {
    expect(customers.map((customer) => customer.name)).toEqual([
      "Bar 88 Melbourne CBD",
      "Richmond Bottle Shop",
      "Northside Hotel",
      "Carlton Wine Room",
      "Chapel Street Liquor",
      "Southbank Events Venue",
    ]);

    expect(regions).toEqual([
      "Melbourne CBD",
      "Richmond",
      "Carlton",
      "Southbank",
      "St Kilda",
      "Regional Victoria",
    ]);

    expect(catalogueCategories).toEqual([
      "Beer",
      "Cider",
      "Wine",
      "Spirits",
      "Ready-to-drink",
      "Non-Alcoholic Drinks",
      "Mixers",
      "Barware",
      "Snacks",
      "Premium / Imported",
      "New Arrivals",
    ]);

    expect(Object.keys(mockDataRegistry).sort()).toEqual([
      "customers",
      "emailDrafts",
      "inventory",
      "locations",
      "orders",
      "posSales",
      "products",
      "regions",
      "supportTickets",
      "workflowLogs",
    ]);
  });

  it("shows the architecture story and compliance disclaimer", () => {
    render(<HomePage />);

    expect(architectureLayers.map((layer) => layer.name)).toEqual([
      "Frontend",
      "Database",
      "AI Layer",
      "Automation Layer",
      "Production integrations",
    ]);

    for (const layer of architectureLayers) {
      expect(screen.getByText(layer.name)).toBeInTheDocument();
    }

    expect(
      screen.getByText(
        /Demo only\. Uses synthetic data\. A real production system would require liquor licensing/i,
      ),
    ).toBeInTheDocument();
  });
});
