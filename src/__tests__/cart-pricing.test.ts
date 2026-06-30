import { calculateCartPricing, submitMockOrder } from "@/lib/cart";
import { products } from "@/lib/mock-data";

describe("cart wholesale pricing", () => {
  it("applies quantity discount, region adjustment, delivery fee, delivery date, stock status, and final total", () => {
    const pricing = calculateCartPricing({
      items: [{ productId: "prod-bayline-pale", quantity: 12 }],
      products,
      region: "Regional Victoria",
      orderDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(pricing.lines).toEqual([
      expect.objectContaining({
        productId: "prod-bayline-pale",
        quantity: 12,
        unitBasePrice: 52,
        unitPrice: 47,
        baseSubtotal: 624,
        discountedSubtotal: 564,
        quantityDiscount: 60,
        stockAvailable: true,
      }),
    ]);
    expect(pricing.baseSubtotal).toBe(624);
    expect(pricing.quantityDiscount).toBe(60);
    expect(pricing.regionAdjustment).toBe(34);
    expect(pricing.deliveryFee).toBe(95);
    expect(pricing.estimatedDeliveryDate).toBe("2026-07-07");
    expect(pricing.total).toBe(693);
  });

  it("submits a mock order and creates inventory, email, and workflow outputs", () => {
    const result = submitMockOrder({
      customerId: "cust-bar-88",
      customerName: "Bar 88 Melbourne CBD",
      items: [{ productId: "prod-bayline-pale", quantity: 3 }],
      products,
      region: "Melbourne CBD",
      orderDate: new Date("2026-06-30T10:00:00+10:00"),
    });

    expect(result.order).toEqual(
      expect.objectContaining({
        customerId: "cust-bar-88",
        status: "Submitted",
        total: 181,
      }),
    );
    expect(result.inventoryUpdates).toEqual([
      {
        productId: "prod-bayline-pale",
        name: "Bayline Session Pale Ale",
        previousStock: 184,
        orderedQuantity: 3,
        newStock: 181,
      },
    ]);
    expect(result.emailDraft.subject).toBe("Order confirmation for Bar 88 Melbourne CBD");
    expect(result.emailDraft.body).toContain("3 cases of Bayline Session Pale Ale");
    expect(result.workflowLogs.map((log) => log.event)).toEqual([
      "Order confirmation created",
      "Stock quantity updated",
      "Confirmation email draft created",
      "n8n webhook trigger queued",
    ]);
    expect(result.confirmationMessage).toBe("n8n workflow triggered for order ORD-MOCK-1002.");
  });
});
