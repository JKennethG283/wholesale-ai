import { answerAssistantPrompt } from "@/lib/assistant";

describe("AI assistant data-aware responses", () => {
  it("answers the reorder prompt with the venue's high-risk products and quantities", () => {
    const response = answerAssistantPrompt("reorder", "cust-bar-88");
    const text = response.body.join(" ");

    expect(response.headline).toContain("Bar 88 Melbourne CBD");
    expect(text).toContain("Bayline Session Pale Ale");
    expect(text).toContain("18");
    expect(text).toContain("2026-07-07");
  });

  it("answers the Melbourne top-sellers prompt from regional POS velocity", () => {
    const response = answerAssistantPrompt("top-melbourne", "cust-bar-88");
    const text = response.body.join(" ");

    expect(response.headline).toContain("Melbourne CBD");
    expect(text).toContain("Bayline Session Pale Ale");
    expect(text).toContain("6");
  });

  it("answers the restock prompt by naming customers with high reorder risk", () => {
    const response = answerAssistantPrompt("restock-customers", "cust-bar-88");
    const text = response.body.join(" ");

    expect(text).toContain("Bar 88 Melbourne CBD");
    expect(text).toContain("Carlton Wine Room");
  });

  it("drafts a personalised recommendation email grounded in the buyer's recommendations", () => {
    const response = answerAssistantPrompt("email-draft", "cust-bar-88");
    const text = response.body.join(" ");

    expect(text).toContain("Bar 88 Melbourne CBD");
    expect(text).toContain("Sparkling Trail Prosecco");
    expect(text.toLowerCase()).toContain("recommend");
  });

  it("summarises a customer's support issue and suggests a response", () => {
    const response = answerAssistantPrompt("support-summary", "cust-southbank-events");
    const text = response.body.join(" ");

    expect(text).toContain("Southbank Events Venue");
    expect(text).toContain("Delivery");
    expect(text.toLowerCase()).toContain("suggested response");
  });

  it("answers the stock-risk prompt with the lowest-stock products", () => {
    const response = answerAssistantPrompt("stock-risk", "cust-bar-88");
    const text = response.body.join(" ");

    expect(text).toContain("Meadowrun Pear Cider");
    expect(text).toContain("Harbour Yard Hazy IPA");
    expect(text.toLowerCase()).toContain("out of stock");
  });
});
