export const navigationItems = [
  { label: "Catalogue", href: "/catalogue" },
  { label: "Cart / Order", href: "/cart" },
  { label: "Buyer Dashboard", href: "/buyer-dashboard" },
  { label: "POS Data", href: "/pos" },
  { label: "AI Recommendations", href: "/ai-recommendations" },
  { label: "AI Assistant", href: "/ai-assistant" },
  { label: "Support Automation", href: "/support" },
  { label: "Admin Dashboard", href: "/admin" },
  { label: "Workflow Log", href: "/workflow-log" },
  { label: "Architecture", href: "/architecture" },
] as const;

export const architectureLayers = [
  {
    name: "Frontend",
    summary: "Next.js and React wholesale portal for buyers and admin teams.",
  },
  {
    name: "Database",
    summary: "Products, customers, orders, inventory, POS sales data, support tickets, email drafts, and workflow logs.",
  },
  {
    name: "AI Layer",
    summary: "Recommendation engine, semantic-style search, assistant, reorder prediction, demand forecasting, issue summaries, email generation, and weekly reporting.",
  },
  {
    name: "Automation Layer",
    summary: "n8n webhook, email sending, stock updates, support ticket creation, sales tasks, and weekly report generation.",
  },
  {
    name: "Production integrations",
    summary: "POS systems, Shopify, Salesforce, Snowflake, AWS, email provider, and warehouse/logistics systems.",
  },
] as const;
