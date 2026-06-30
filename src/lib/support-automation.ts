import { customers } from "@/lib/mock-data";

export type SupportIssueType =
  | "Late delivery"
  | "Missing cases"
  | "Stock issue"
  | "Invoice issue"
  | "Product quality"
  | "General enquiry";

export type SupportPriority = "Low" | "Medium" | "High";

export type SupportAutomationResult = {
  issueType: SupportIssueType;
  themes: SupportIssueType[];
  priority: SupportPriority;
  suggestedTeam: string;
  summary: string;
  suggestedResponse: string;
  emailDraft: string;
  ticketId: string;
  workflow: WorkflowEvent[];
};

export type WorkflowEvent = {
  type: "summary" | "ticket" | "notification" | "email";
  label: string;
  detail: string;
};

export type SupportAutomationOptions = {
  customerId?: string;
};

type ThemeRule = {
  type: SupportIssueType;
  priority: SupportPriority;
  suggestedTeam: string;
  response: string;
  pattern: RegExp;
};

const themeRules: ThemeRule[] = [
  {
    type: "Product quality",
    priority: "High",
    suggestedTeam: "Quality Assurance",
    response:
      "Thank you for flagging this and we're sorry the product arrived in poor condition. We'll arrange a replacement or credit for the affected stock right away and pass the batch to our quality team for review.",
    pattern: /(damaged|broken|leaking|faulty|spoil|off|quality|expired|smashed)/,
  },
  {
    type: "Missing cases",
    priority: "High",
    suggestedTeam: "Logistics",
    response:
      "Apologies for the shortfall in your delivery. We've confirmed the missing cases against your order and will dispatch the outstanding stock on priority, with a credit applied if you'd prefer.",
    pattern: /(missing|short[- ]?(ship|deliver)|didn'?t receive|not received|cases? (were|are) missing)/,
  },
  {
    type: "Invoice issue",
    priority: "Medium",
    suggestedTeam: "Finance",
    response:
      "Thanks for raising this billing query. We're reviewing the invoice now and will issue a corrected statement, refunding any overcharge within two business days.",
    pattern: /(invoice|billing|bill|overcharg|charged|payment|refund)/,
  },
  {
    type: "Late delivery",
    priority: "Medium",
    suggestedTeam: "Logistics",
    response:
      "We apologise that your delivery arrived later than scheduled. We're confirming a revised delivery window with our logistics team and will keep you updated until it's resolved.",
    pattern: /(late|delay|arriv)/,
  },
  {
    type: "Stock issue",
    priority: "Low",
    suggestedTeam: "Inventory",
    response:
      "Thanks for checking in. That line is currently low on stock — we're expediting replenishment and can notify you the moment it's available or suggest a close alternative.",
    pattern: /(out of stock|stock|unavailable|backorder|sold out)/,
  },
];

const generalEnquiry: ThemeRule = {
  type: "General enquiry",
  priority: "Low",
  suggestedTeam: "Customer Success",
  response:
    "Thanks for getting in touch. We've logged your enquiry and a member of our team will follow up shortly with the details you need.",
  pattern: /.*/,
};

function buildSummary(type: SupportIssueType, issueText: string): string {
  const condensed = issueText.trim().replace(/\s+/g, " ");
  const excerpt = condensed.length > 110 ? `${condensed.slice(0, 107)}...` : condensed;
  return `${type} reported: "${excerpt}"`;
}

function buildTicketId(issueText: string): string {
  let hash = 0;
  for (let index = 0; index < issueText.length; index += 1) {
    hash = (hash * 31 + issueText.charCodeAt(index)) % 100000;
  }
  return `SUP-${String(hash).padStart(5, "0")}`;
}

function buildWorkflow(
  rule: ThemeRule,
  ticketId: string,
  summary: string,
  customerName?: string,
): WorkflowEvent[] {
  const subject = customerName ?? "the customer";
  const notifyDetail =
    rule.suggestedTeam === "Logistics"
      ? `Logistics team notified to action the ${rule.type.toLowerCase()}.`
      : `${rule.suggestedTeam} team notified to action the ${rule.type.toLowerCase()}.`;

  return [
    { type: "summary", label: "Issue summarised", detail: summary },
    {
      type: "ticket",
      label: "Support ticket created",
      detail: `Ticket ${ticketId} opened for ${subject} (${rule.priority} priority).`,
    },
    { type: "notification", label: `${rule.suggestedTeam} notified`, detail: notifyDetail },
    {
      type: "email",
      label: "Email draft prepared",
      detail: `Draft response queued for ${subject}.`,
    },
  ];
}

function resolveCustomerName(customerId?: string): string | undefined {
  if (!customerId) {
    return undefined;
  }
  return customers.find((customer) => customer.id === customerId)?.name;
}

function buildEmailDraft(
  rule: ThemeRule,
  response: string,
  customerName?: string,
): string {
  const greeting = customerName ? `Dear ${customerName} team,` : "Dear valued customer,";
  return [
    `Subject: Re: your ${rule.type.toLowerCase()} enquiry`,
    "",
    greeting,
    "",
    response,
    "",
    "Kind regards,",
    "LiquorOps AI Support",
  ].join("\n");
}

function matchRule(text: string): ThemeRule {
  return themeRules.find((rule) => rule.pattern.test(text)) ?? generalEnquiry;
}

function detectThemes(text: string): SupportIssueType[] {
  const matched = themeRules
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => rule.type);
  return matched.length > 0 ? matched : [generalEnquiry.type];
}

export function automateSupportIssue(
  issueText: string,
  options: SupportAutomationOptions = {},
): SupportAutomationResult {
  const text = issueText.toLowerCase();
  const rule = matchRule(text);
  const customerName = resolveCustomerName(options.customerId);
  const summary = buildSummary(rule.type, issueText);
  const ticketId = buildTicketId(issueText);

  return {
    issueType: rule.type,
    themes: detectThemes(text),
    priority: rule.priority,
    suggestedTeam: rule.suggestedTeam,
    summary,
    suggestedResponse: rule.response,
    emailDraft: buildEmailDraft(rule, rule.response, customerName),
    ticketId,
    workflow: buildWorkflow(rule, ticketId, summary, customerName),
  };
}
