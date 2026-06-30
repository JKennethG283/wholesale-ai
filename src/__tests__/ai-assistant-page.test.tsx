import { fireEvent, render, screen, within } from "@testing-library/react";
import AiAssistantPage from "@/app/ai-assistant/page";
import { assistantPrompts } from "@/lib/assistant";

describe("AI assistant page", () => {
  it("renders a chat interface and answers every preset prompt with data-aware content", () => {
    render(<AiAssistantPage />);

    expect(
      screen.getByRole("heading", { name: /AI assistant/i }),
    ).toBeInTheDocument();

    for (const prompt of assistantPrompts) {
      expect(screen.getByRole("button", { name: prompt.text })).toBeInTheDocument();
    }

    for (const prompt of assistantPrompts) {
      fireEvent.click(screen.getByRole("button", { name: prompt.text }));
    }

    const log = screen.getByRole("log");

    for (const needle of [
      "Bayline Session Pale Ale",
      "Carlton Wine Room",
      "Sparkling Trail Prosecco",
      "Southbank Events Venue",
      "Meadowrun Pear Cider",
    ]) {
      expect(within(log).getAllByText(new RegExp(needle)).length).toBeGreaterThan(0);
    }
  });
});
