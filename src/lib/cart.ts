import type { CatalogueProduct } from "@/lib/catalogue";

export type CartItemInput = {
  productId: string;
  quantity: number;
};

export type DeliveryRegion =
  | "Melbourne CBD"
  | "Richmond"
  | "Carlton"
  | "Southbank"
  | "St Kilda"
  | "Regional Victoria";

export type CartPricingInput = {
  items: CartItemInput[];
  products: readonly CatalogueProduct[];
  region: DeliveryRegion;
  orderDate: Date;
};

export type MockOrderInput = CartPricingInput & {
  customerId: string;
  customerName: string;
};

export type CartPricingLine = {
  productId: string;
  name: string;
  quantity: number;
  stock: number;
  unitBasePrice: number;
  unitPrice: number;
  baseSubtotal: number;
  discountedSubtotal: number;
  quantityDiscount: number;
  stockAvailable: boolean;
};

export type CartPricing = {
  lines: CartPricingLine[];
  baseSubtotal: number;
  discountedSubtotal: number;
  quantityDiscount: number;
  regionAdjustment: number;
  deliveryFee: number;
  estimatedDeliveryDate: string;
  total: number;
  hasStockIssue: boolean;
};

export type MockOrderResult = {
  order: {
    id: string;
    customerId: string;
    status: "Submitted";
    total: number;
    estimatedDeliveryDate: string;
  };
  inventoryUpdates: Array<{
    productId: string;
    name: string;
    previousStock: number;
    orderedQuantity: number;
    newStock: number;
  }>;
  emailDraft: {
    id: string;
    customerId: string;
    subject: string;
    body: string;
  };
  workflowLogs: Array<{
    id: string;
    event: string;
    status: "Complete" | "Queued";
  }>;
  confirmationMessage: string;
};

const regionAdjustmentRates: Record<DeliveryRegion, number> = {
  "Melbourne CBD": 0,
  Richmond: 0.01,
  Carlton: 0.015,
  Southbank: 0.02,
  "St Kilda": 0.025,
  "Regional Victoria": 0.06,
};

const deliveryFees: Record<DeliveryRegion, number> = {
  "Melbourne CBD": 25,
  Richmond: 35,
  Carlton: 35,
  Southbank: 35,
  "St Kilda": 45,
  "Regional Victoria": 95,
};

const deliveryBusinessDays: Record<DeliveryRegion, number> = {
  "Melbourne CBD": 1,
  Richmond: 2,
  Carlton: 2,
  Southbank: 2,
  "St Kilda": 2,
  "Regional Victoria": 5,
};

function getUnitPrice(product: CatalogueProduct, quantity: number) {
  return [...product.quantityPricing]
    .sort((a, b) => b.minCases - a.minCases)
    .find((tier) => quantity >= tier.minCases)?.price ?? product.basePrice;
}

function addBusinessDays(date: Date, businessDays: number) {
  const deliveryDate = new Date(date);
  let daysAdded = 0;

  while (daysAdded < businessDays) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
    const day = deliveryDate.getDay();

    if (day !== 0 && day !== 6) {
      daysAdded += 1;
    }
  }

  return deliveryDate.toISOString().slice(0, 10);
}

export function calculateCartPricing({
  items,
  products,
  region,
  orderDate,
}: CartPricingInput): CartPricing {
  const lines = items.flatMap((item): CartPricingLine[] => {
    const product = products.find((candidate) => candidate.id === item.productId);

    if (!product || item.quantity <= 0) {
      return [];
    }

    const unitPrice = getUnitPrice(product, item.quantity);
    const baseSubtotal = product.basePrice * item.quantity;
    const discountedSubtotal = unitPrice * item.quantity;

    return [
      {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        stock: product.stock,
        unitBasePrice: product.basePrice,
        unitPrice,
        baseSubtotal,
        discountedSubtotal,
        quantityDiscount: baseSubtotal - discountedSubtotal,
        stockAvailable: item.quantity <= product.stock,
      },
    ];
  });

  const baseSubtotal = lines.reduce((sum, line) => sum + line.baseSubtotal, 0);
  const discountedSubtotal = lines.reduce((sum, line) => sum + line.discountedSubtotal, 0);
  const quantityDiscount = baseSubtotal - discountedSubtotal;
  const regionAdjustment = Math.round(discountedSubtotal * regionAdjustmentRates[region]);
  const deliveryFee = discountedSubtotal >= 1500 ? 0 : deliveryFees[region];
  const total = discountedSubtotal + regionAdjustment + deliveryFee;

  return {
    lines,
    baseSubtotal,
    discountedSubtotal,
    quantityDiscount,
    regionAdjustment,
    deliveryFee,
    estimatedDeliveryDate: addBusinessDays(orderDate, deliveryBusinessDays[region]),
    total,
    hasStockIssue: lines.some((line) => !line.stockAvailable),
  };
}

export function submitMockOrder(input: MockOrderInput): MockOrderResult {
  const pricing = calculateCartPricing(input);

  if (pricing.hasStockIssue) {
    throw new Error("Cannot submit order while a quantity exceeds available stock.");
  }

  const orderId = "ORD-MOCK-1002";
  const inventoryUpdates = pricing.lines.map((line) => ({
    productId: line.productId,
    name: line.name,
    previousStock: line.stock,
    orderedQuantity: line.quantity,
    newStock: line.stock - line.quantity,
  }));
  const orderedProducts = pricing.lines
    .map((line) => `${line.quantity} cases of ${line.name}`)
    .join(", ");

  return {
    order: {
      id: orderId,
      customerId: input.customerId,
      status: "Submitted",
      total: pricing.total,
      estimatedDeliveryDate: pricing.estimatedDeliveryDate,
    },
    inventoryUpdates,
    emailDraft: {
      id: "EMAIL-MOCK-1002",
      customerId: input.customerId,
      subject: `Order confirmation for ${input.customerName}`,
      body: `${input.customerName}, your order ${orderId} includes ${orderedProducts}. Estimated delivery is ${pricing.estimatedDeliveryDate}.`,
    },
    workflowLogs: [
      {
        id: "WF-MOCK-1002-1",
        event: "Order confirmation created",
        status: "Complete",
      },
      {
        id: "WF-MOCK-1002-2",
        event: "Stock quantity updated",
        status: "Complete",
      },
      {
        id: "WF-MOCK-1002-3",
        event: "Confirmation email draft created",
        status: "Complete",
      },
      {
        id: "WF-MOCK-1002-4",
        event: "n8n webhook trigger queued",
        status: "Queued",
      },
    ],
    confirmationMessage: `n8n workflow triggered for order ${orderId}.`,
  };
}
