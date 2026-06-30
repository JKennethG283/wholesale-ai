import { fireEvent, render, screen, within } from "@testing-library/react";
import CataloguePage from "@/app/catalogue/page";
import { filterCatalogueProducts, getStockStatus } from "@/lib/catalogue";
import { catalogueCategories, products } from "@/lib/mock-data";

describe("product catalogue browsing", () => {
  it("searches products by product name", () => {
    const matches = filterCatalogueProducts(products, {
      search: "coastal gin",
    });

    expect(matches.map((product) => product.name)).toEqual([
      "Copperstill Coastal Gin",
    ]);
  });

  it("combines category, region, and price filters", () => {
    const matches = filterCatalogueProducts(products, {
      category: "Beer",
      region: "Richmond",
      maxPrice: 55,
    });

    expect(matches.map((product) => product.name)).toEqual([
      "Bayline Session Pale Ale",
    ]);
  });

  it("filters by subcategory when a category has meaningful subgroups", () => {
    const matches = filterCatalogueProducts(products, {
      category: "Wine",
      subcategory: "Sparkling",
    });

    expect(matches.map((product) => product.name)).toEqual([
      "Sparkling Trail Prosecco",
    ]);
  });

  it("classifies stock levels for product cards", () => {
    expect(getStockStatus(184)).toEqual({ label: "In stock", tone: "in" });
    expect(getStockStatus(28)).toEqual({ label: "Low stock", tone: "low" });
    expect(getStockStatus(0)).toEqual({ label: "Out of stock", tone: "out" });
  });

  it("renders category sections and detailed wholesale product cards", () => {
    render(<CataloguePage />);

    for (const category of catalogueCategories) {
      expect(
        screen.getByRole("heading", { name: category }),
      ).toBeInTheDocument();
    }

    const paleAleCard = screen.getByRole("article", {
      name: /Bayline Session Pale Ale/i,
    });

    expect(within(paleAleCard).getByText("Harbour Yard Brewing")).toBeInTheDocument();
    expect(within(paleAleCard).getAllByText("Pale Ale")).toHaveLength(2);
    expect(within(paleAleCard).getByText("184 cases")).toBeInTheDocument();
    expect(within(paleAleCard).getByText("In stock")).toBeInTheDocument();
    expect(within(paleAleCard).getByText("Melbourne CBD, Richmond, Carlton")).toBeInTheDocument();
    expect(within(paleAleCard).getByText("$52 / case")).toBeInTheDocument();
    expect(within(paleAleCard).getByText("12+ cases $47")).toBeInTheDocument();
    expect(within(paleAleCard).getByText("Repeat-order fit")).toBeInTheDocument();
    expect(within(paleAleCard).getByText(/Similar: Ridgeway Clean Lager/i)).toBeInTheDocument();
  });

  it("hides empty category sections so filtered results stay scannable", () => {
    render(<CataloguePage />);

    fireEvent.change(screen.getByLabelText("Search products"), {
      target: { value: "coastal gin" },
    });

    expect(
      screen.getByRole("heading", { name: "Spirits" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Beer" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No visible products in this category/i),
    ).not.toBeInTheDocument();
  });

  it("lets buyers search, combine filters, and recover from empty results", () => {
    render(<CataloguePage />);

    fireEvent.change(screen.getByLabelText("Search products"), {
      target: { value: "coastal gin" },
    });

    expect(
      screen.getByRole("article", { name: /Copperstill Coastal Gin/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("article", { name: /Bayline Session Pale Ale/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: "Beer" },
    });
    fireEvent.change(screen.getByLabelText("Subcategory"), {
      target: { value: "IPA" },
    });
    fireEvent.change(screen.getByLabelText("Region"), {
      target: { value: "St Kilda" },
    });
    fireEvent.change(screen.getByLabelText("Base price"), {
      target: { value: "100" },
    });

    expect(
      screen.getByRole("article", { name: /Harbour Yard Hazy IPA/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 23 synthetic wholesale products.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Base price"), {
      target: { value: "50" },
    });

    expect(
      screen.getByRole("heading", { name: /No catalogue products match these filters/i }),
    ).toBeInTheDocument();
  });
});
