export const regions = [
  "Melbourne CBD",
  "Richmond",
  "Carlton",
  "Southbank",
  "St Kilda",
  "Regional Victoria",
] as const;

export const catalogueCategories = [
  "Beer",
  "Cider",
  "Wine",
  "Spirits",
  "Ready-to-drink",
  "Non-Alcoholic Drinks",
  "Mixers",
  "Barware",
  "Snacks",
  "Premium / Imported",
  "New Arrivals",
] as const;

export const customers = [
  {
    id: "cust-bar-88",
    name: "Bar 88 Melbourne CBD",
    segment: "Craft beer-focused venue",
    region: "Melbourne CBD",
  },
  {
    id: "cust-richmond-bottle",
    name: "Richmond Bottle Shop",
    segment: "High-volume low-margin buyer",
    region: "Richmond",
  },
  {
    id: "cust-northside-hotel",
    name: "Northside Hotel",
    segment: "Seasonal buyer",
    region: "Regional Victoria",
  },
  {
    id: "cust-carlton-wine",
    name: "Carlton Wine Room",
    segment: "Premium wine buyer",
    region: "Carlton",
  },
  {
    id: "cust-chapel-liquor",
    name: "Chapel Street Liquor",
    segment: "Premium spirits buyer",
    region: "St Kilda",
  },
  {
    id: "cust-southbank-events",
    name: "Southbank Events Venue",
    segment: "Fast-growing customer",
    region: "Southbank",
  },
] as const;

export const products = [
  {
    id: "prod-bayline-pale",
    name: "Bayline Session Pale Ale",
    brand: "Harbour Yard Brewing",
    category: "Beer",
    stock: 184,
    regions: ["Melbourne CBD", "Richmond", "Carlton"],
    basePrice: 52,
  },
  {
    id: "prod-ridge-lager",
    name: "Ridgeway Clean Lager",
    brand: "South Range Brewers",
    category: "Beer",
    stock: 96,
    regions: ["Southbank", "St Kilda", "Regional Victoria"],
    basePrice: 48,
  },
  {
    id: "prod-orchard-cider",
    name: "Ironbark Dry Apple Cider",
    brand: "Field Press Co.",
    category: "Cider",
    stock: 74,
    regions: ["Richmond", "Carlton", "Southbank"],
    basePrice: 46,
  },
  {
    id: "prod-carlton-pinot",
    name: "Redbrick Lane Pinot Noir",
    brand: "Vale & Row",
    category: "Wine",
    stock: 61,
    regions: ["Melbourne CBD", "Carlton", "St Kilda"],
    basePrice: 138,
  },
  {
    id: "prod-juniper-gin",
    name: "Copperstill Coastal Gin",
    brand: "Atlas Stillhouse",
    category: "Spirits",
    stock: 42,
    regions: ["Melbourne CBD", "Southbank"],
    basePrice: 212,
  },
  {
    id: "prod-citrus-rtd",
    name: "North Pier Citrus Spritz Cans",
    brand: "North Pier Drinks",
    category: "Ready-to-drink",
    stock: 155,
    regions: ["Melbourne CBD", "Richmond", "St Kilda", "Southbank"],
    basePrice: 58,
  },
  {
    id: "prod-zero-hop",
    name: "Clearway Zero Hop Ale",
    brand: "Clearway Brewing",
    category: "Non-Alcoholic Drinks",
    stock: 133,
    regions: ["Carlton", "Southbank", "Regional Victoria"],
    basePrice: 39,
  },
  {
    id: "prod-tonic",
    name: "Botanical Dry Tonic 24 Pack",
    brand: "Quarterline Mixers",
    category: "Mixers",
    stock: 220,
    regions: ["Melbourne CBD", "Richmond", "Carlton", "Southbank", "St Kilda"],
    basePrice: 31,
  },
  {
    id: "prod-glassware",
    name: "Venue Stemless Tasting Glasses",
    brand: "Service Line",
    category: "Barware",
    stock: 36,
    regions: ["Melbourne CBD", "Regional Victoria"],
    basePrice: 86,
  },
  {
    id: "prod-snacks",
    name: "Salted Kernel Bar Mix Carton",
    brand: "Counter Goods",
    category: "Snacks",
    stock: 88,
    regions: ["Richmond", "Carlton", "St Kilda"],
    basePrice: 44,
  },
  {
    id: "prod-imported-whisky",
    name: "Kuro Peak Blended Whisky",
    brand: "Kuro Peak",
    category: "Premium / Imported",
    stock: 18,
    regions: ["Melbourne CBD", "Southbank", "St Kilda"],
    basePrice: 390,
  },
  {
    id: "prod-new-sauv",
    name: "Morning Cut Sauvignon Blanc",
    brand: "Tidal Block",
    category: "New Arrivals",
    stock: 67,
    regions: ["Melbourne CBD", "Richmond", "Carlton"],
    basePrice: 118,
  },
] as const;

export const orders = [
  {
    id: "ord-1001",
    customerId: "cust-bar-88",
    status: "Delivered",
    total: 2840,
  },
] as const;

export const inventory = products.map((product) => ({
  productId: product.id,
  onHand: product.stock,
  reorderPoint: product.stock < 50 ? 60 : 90,
}));

export const posSales = [
  {
    id: "pos-001",
    customerId: "cust-bar-88",
    productId: "prod-bayline-pale",
    weeklyUnits: 44,
  },
] as const;

export const supportTickets = [
  {
    id: "sup-001",
    customerId: "cust-southbank-events",
    type: "Delivery",
    priority: "Medium",
    status: "Open",
  },
] as const;

export const emailDrafts = [
  {
    id: "email-001",
    customerId: "cust-carlton-wine",
    subject: "Suggested premium wine replenishment",
  },
] as const;

export const workflowLogs = [
  {
    id: "wf-001",
    event: "Weekly report generated",
    status: "Complete",
  },
] as const;

export const locations = regions.map((region) => ({
  region,
  deliveryWindow: region === "Regional Victoria" ? "3-5 business days" : "1-2 business days",
}));

export const mockDataRegistry = {
  customers,
  emailDrafts,
  inventory,
  locations,
  orders,
  posSales,
  products,
  regions,
  supportTickets,
  workflowLogs,
};
