import { fireEvent, render, screen, within } from "@testing-library/react";
import SupportPage from "@/app/support/page";

describe("Support automation page", () => {
  it("classifies a submitted issue and runs the full automation workflow", () => {
    render(<SupportPage />);

    expect(
      screen.getByRole("heading", { name: /Support Automation/i }),
    ).toBeInTheDocument();

    const textarea = screen.getByLabelText(/describe the (support )?issue/i);
    fireEvent.change(textarea, {
      target: { value: "My delivery arrived late and two cases were missing." },
    });
    fireEvent.click(screen.getByRole("button", { name: /run automation/i }));

    const classification = screen.getByRole("region", { name: /classification/i });
    expect(within(classification).getAllByText(/Missing cases/).length).toBeGreaterThan(0);
    expect(within(classification).getByText(/Logistics/)).toBeInTheDocument();

    const response = screen.getByRole("region", { name: /suggested response/i });
    expect(within(response).getByText(/apolog|missing/i)).toBeInTheDocument();

    const email = screen.getByRole("region", { name: /email draft/i });
    expect(within(email).getByText(/Subject:/i)).toBeInTheDocument();

    const log = screen.getByRole("region", { name: /workflow log/i });
    expect(within(log).getByText(/Support ticket created/i)).toBeInTheDocument();
    expect(within(log).getAllByText(/notified/i).length).toBeGreaterThan(0);
    expect(within(log).getByText(/Email draft prepared/i)).toBeInTheDocument();
    expect(within(log).getByText(/Issue summarised/i)).toBeInTheDocument();
  });
});
