import { render, screen, within } from "@testing-library/react";
import WorkflowLogPage from "@/app/workflow-log/page";

describe("Workflow log page", () => {
  it("renders the automation log with all event types and an AI workflow insight", () => {
    render(<WorkflowLogPage />);

    expect(
      screen.getByRole("heading", { name: /Workflow Log/i }),
    ).toBeInTheDocument();

    const log = screen.getByRole("region", { name: /automation log/i });
    for (const label of [
      "Order confirmation",
      "Stock update",
      "Email draft",
      "Support ticket",
      "n8n webhook",
      "Reorder recommendation",
      "Weekly report",
    ]) {
      expect(within(log).getAllByText(new RegExp(label, "i")).length).toBeGreaterThan(0);
    }

    expect(within(log).getAllByText(/Southbank Events Venue/).length).toBeGreaterThan(0);

    const insight = screen.getByRole("note", { name: /ai insight/i });
    expect(insight.textContent).toMatch(/AI workflow/i);
  });
});
