import { render, screen, within } from "@testing-library/react";
import ArchitecturePage from "@/app/architecture/page";

describe("Architecture page", () => {
  it("explains every layer and names production integration targets", () => {
    render(<ArchitecturePage />);

    expect(screen.getByRole("heading", { name: /Architecture/i })).toBeInTheDocument();

    const layers = screen.getByRole("region", { name: /architecture layers/i });
    for (const layer of [
      "Frontend",
      "Database",
      "AI Layer",
      "Automation Layer",
      "Production integrations",
    ]) {
      expect(within(layers).getByText(new RegExp(layer, "i"))).toBeInTheDocument();
    }

    const integrationsText = layers.textContent ?? "";
    for (const target of [
      "POS",
      "Shopify",
      "Salesforce",
      "Snowflake",
      "AWS",
      "email",
      "logistics",
    ]) {
      expect(integrationsText).toMatch(new RegExp(target, "i"));
    }
  });

  it("shows a compliance disclaimer and a coherent end-to-end demo path", () => {
    render(<ArchitecturePage />);

    const disclaimer = screen.getByRole("note", { name: /compliance/i });
    expect(disclaimer.textContent).toMatch(/synthetic data/i);

    const demo = screen.getByRole("region", { name: /demo/i });
    expect(demo.textContent).toMatch(/catalogue/i);
    expect(demo.textContent).toMatch(/workflow log/i);
    expect(demo.textContent).toMatch(/admin/i);
  });
});
