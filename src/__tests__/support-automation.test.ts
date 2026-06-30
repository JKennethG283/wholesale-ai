import { automateSupportIssue } from "@/lib/support-automation";

describe("support automation classification", () => {
  it("classifies a late-delivery complaint", () => {
    const result = automateSupportIssue("My order arrived two days late.");

    expect(result.issueType).toBe("Late delivery");
  });

  it("classifies a missing-cases complaint", () => {
    const result = automateSupportIssue("Two cases were missing from the pallet.");

    expect(result.issueType).toBe("Missing cases");
  });

  it("classifies a stock-availability issue", () => {
    const result = automateSupportIssue("The pale ale I want is out of stock again.");

    expect(result.issueType).toBe("Stock issue");
  });

  it("classifies an invoice/billing issue", () => {
    const result = automateSupportIssue("I was overcharged on last week's invoice.");

    expect(result.issueType).toBe("Invoice issue");
  });

  it("classifies a product-quality issue", () => {
    const result = automateSupportIssue("Several bottles arrived damaged and leaking.");

    expect(result.issueType).toBe("Product quality");
  });
});

describe("support automation prioritisation", () => {
  it("flags missing cases as high priority", () => {
    expect(automateSupportIssue("Two cases were missing.").priority).toBe("High");
  });

  it("flags product quality as high priority", () => {
    expect(automateSupportIssue("Bottles arrived damaged.").priority).toBe("High");
  });

  it("flags late delivery as medium priority", () => {
    expect(automateSupportIssue("My order arrived late.").priority).toBe("Medium");
  });

  it("flags stock enquiries as low priority", () => {
    expect(automateSupportIssue("Is the pale ale out of stock?").priority).toBe("Low");
  });
});

describe("support automation team routing", () => {
  it("routes delivery and missing-cases issues to Logistics", () => {
    expect(automateSupportIssue("My order arrived late.").suggestedTeam).toBe("Logistics");
    expect(automateSupportIssue("Two cases were missing.").suggestedTeam).toBe("Logistics");
  });

  it("routes invoice issues to Finance", () => {
    expect(automateSupportIssue("I was overcharged on my invoice.").suggestedTeam).toBe(
      "Finance",
    );
  });

  it("routes product-quality issues to Quality Assurance", () => {
    expect(automateSupportIssue("Bottles arrived damaged.").suggestedTeam).toBe(
      "Quality Assurance",
    );
  });

  it("routes stock issues to Inventory", () => {
    expect(automateSupportIssue("That line is out of stock.").suggestedTeam).toBe(
      "Inventory",
    );
  });
});

describe("support automation customer response", () => {
  it("drafts a professional response specific to a late delivery", () => {
    const response = automateSupportIssue("My order arrived two days late.").suggestedResponse.toLowerCase();

    expect(response).toContain("apolog");
    expect(response).toContain("deliver");
  });

  it("drafts a response offering replacement for damaged product", () => {
    const response = automateSupportIssue("Bottles arrived damaged.").suggestedResponse.toLowerCase();

    expect(response).toContain("replace");
  });

  it("includes a short summary grounded in the submitted issue", () => {
    const result = automateSupportIssue("Two cases were missing from my delivery.");

    expect(result.summary).toContain("Missing cases");
    expect(result.summary.length).toBeLessThanOrEqual(160);
  });
});

describe("support automation email draft", () => {
  it("drafts a personalised email referencing the customer and issue", () => {
    const result = automateSupportIssue("My order arrived two days late.", {
      customerId: "cust-bar-88",
    });

    expect(result.emailDraft).toContain("Bar 88 Melbourne CBD");
    expect(result.emailDraft.toLowerCase()).toContain("subject:");
    expect(result.emailDraft).toContain("LiquorOps AI");
  });

  it("falls back to a generic greeting when no customer is provided", () => {
    const result = automateSupportIssue("My order arrived two days late.");

    expect(result.emailDraft.toLowerCase()).toContain("subject:");
    expect(result.emailDraft).toContain("LiquorOps AI");
  });
});

describe("support automation workflow events", () => {
  it("logs ticket creation, team notification, email draft, and issue summary", () => {
    const result = automateSupportIssue("Two cases were missing.", {
      customerId: "cust-bar-88",
    });
    const types = result.workflow.map((event) => event.type);

    expect(types).toContain("summary");
    expect(types).toContain("ticket");
    expect(types).toContain("notification");
    expect(types).toContain("email");
  });

  it("notifies the logistics team for delivery-related issues", () => {
    const result = automateSupportIssue("My order arrived two days late.");
    const notification = result.workflow.find((event) => event.type === "notification");

    expect(notification?.detail).toContain("Logistics");
  });

  it("creates a deterministic support ticket id", () => {
    const first = automateSupportIssue("Two cases were missing.");
    const second = automateSupportIssue("Two cases were missing.");

    expect(first.ticketId).toMatch(/^SUP-/);
    expect(first.ticketId).toBe(second.ticketId);
  });
});

describe("support automation multi-theme handling", () => {
  it("prioritises the most severe theme and lists all detected themes", () => {
    const result = automateSupportIssue(
      "My delivery arrived late and two cases were missing.",
    );

    expect(result.issueType).toBe("Missing cases");
    expect(result.priority).toBe("High");
    expect(result.themes).toEqual(
      expect.arrayContaining(["Missing cases", "Late delivery"]),
    );
  });
});
