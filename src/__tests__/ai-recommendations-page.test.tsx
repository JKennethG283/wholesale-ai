import { render, screen, within } from "@testing-library/react";
import AiRecommendationsPage from "@/app/ai-recommendations/page";

describe("AI recommendations page", () => {
  it("separates the lexical, semantic, and reranking stages with grounded explanations", () => {
    render(<AiRecommendationsPage />);

    expect(
      screen.getByRole("heading", { name: /AI recommendations/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: /lexical/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /semantic/i }),
    ).toBeInTheDocument();

    const reranked = screen.getByRole("region", { name: /reranked recommendations/i });
    expect(
      within(reranked).getByText("Clearway Zero Hop Ale"),
    ).toBeInTheDocument();
    expect(
      within(reranked).getByText(/Ridgeway Clean Lager/),
    ).toBeInTheDocument();
    expect(
      within(reranked).getAllByRole("link", { name: /catalogue/i }).length,
    ).toBeGreaterThan(0);
  });
});
