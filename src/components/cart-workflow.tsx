"use client";

import Link from "next/link";
import { Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculateCartPricing,
  submitMockOrder,
  type CartItemInput,
  type DeliveryRegion,
  type MockOrderResult,
} from "@/lib/cart";
import { customers, products, regions } from "@/lib/mock-data";
import { navigationItems } from "@/lib/navigation";

const cartStorageKey = "liquorops-cart";
const demoOrderDate = new Date("2026-06-30T10:00:00+10:00");

function money(amount: number) {
  return new Intl.NumberFormat("en-AU", {
    currency: "AUD",
    style: "currency",
  }).format(amount);
}

function readCart(): CartItemInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItemInput[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  }
}

export function CartWorkflow() {
  const [cartItems, setCartItems] = useState<CartItemInput[]>(readCart);
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const selectedCustomer = customers.find((customer) => customer.id === customerId) ?? customers[0];
  const [region, setRegion] = useState<DeliveryRegion>(
    selectedCustomer.region as DeliveryRegion,
  );
  const [submission, setSubmission] = useState<MockOrderResult | null>(null);

  const pricing = useMemo(
    () =>
      calculateCartPricing({
        items: cartItems,
        products,
        region,
        orderDate: demoOrderDate,
      }),
    [cartItems, region],
  );

  function updateCart(nextItems: CartItemInput[]) {
    setCartItems(nextItems);
    writeCart(nextItems);
    setSubmission(null);
  }

  function updateQuantity(productId: string, quantity: number) {
    updateCart(
      cartItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity || 1) }
          : item,
      ),
    );
  }

  function removeItem(productId: string) {
    updateCart(cartItems.filter((item) => item.productId !== productId));
  }

  function submitOrder() {
    setSubmission(
      submitMockOrder({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items: cartItems,
        products,
        region,
        orderDate: demoOrderDate,
      }),
    );
  }

  return (
    <div className="shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-lockup" href="/" aria-label="LiquorOps AI home">
            <span className="brand-mark">LO</span>
            <span className="brand-text">
              <strong>LiquorOps AI</strong>
              <span>Synthetic wholesale portal</span>
            </span>
          </Link>
          <nav className="primary-nav" aria-label="Primary">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="cart-main">
        <section className="cart-title-band" aria-labelledby="cart-title">
          <div>
            <p className="eyebrow">Cart / Order</p>
            <h1 id="cart-title">Wholesale order workflow</h1>
            <p>
              Build a buyer cart, validate stock, price delivery, and submit a simulated order
              that creates the automation trail.
            </p>
          </div>
          <div className="cart-order-controls">
            <label className="control">
              <span>Buyer</span>
              <select
                value={customerId}
                onChange={(event) => {
                  const nextCustomer = customers.find(
                    (customer) => customer.id === event.target.value,
                  );
                  setCustomerId(event.target.value);
                  setRegion((nextCustomer?.region ?? regions[0]) as DeliveryRegion);
                  setSubmission(null);
                }}
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="control">
              <span>Delivery region</span>
              <select
                aria-label="Delivery region"
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value as DeliveryRegion);
                  setSubmission(null);
                }}
              >
                {regions.map((deliveryRegion) => (
                  <option key={deliveryRegion} value={deliveryRegion}>
                    {deliveryRegion}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="cart-grid">
          <section className="cart-panel" aria-labelledby="cart-items-title">
            <div className="cart-panel-heading">
              <h2 id="cart-items-title">Cart items</h2>
              <Link href="/catalogue">Browse catalogue</Link>
            </div>

            {pricing.lines.length === 0 ? (
              <div className="empty-state">
                <h2>No products in cart</h2>
                <p>Add products from the catalogue to begin a simulated wholesale order.</p>
              </div>
            ) : (
              <div className="cart-lines">
                {pricing.lines.map((line) => (
                  <fieldset
                    className={`cart-line ${line.stockAvailable ? "" : "cart-line-alert"}`}
                    key={line.productId}
                    aria-label={`${line.name} cart item`}
                  >
                    <div>
                      <legend>{line.name}</legend>
                      <p>{line.stock} cases available</p>
                      {!line.stockAvailable ? (
                        <p className="stock-alert">
                          Exceeds available stock by {line.quantity - line.stock} cases.
                        </p>
                      ) : null}
                    </div>

                    <label className="quantity-control">
                      <span>Qty</span>
                      <input
                        aria-label={`Quantity for ${line.name}`}
                        min={1}
                        type="number"
                        value={line.quantity}
                        onChange={(event) =>
                          updateQuantity(line.productId, Number(event.target.value))
                        }
                      />
                    </label>

                    <dl className="line-pricing">
                      <div>
                        <dt>Unit</dt>
                        <dd>{money(line.unitPrice)}</dd>
                      </div>
                      <div>
                        <dt>Line</dt>
                        <dd>{money(line.discountedSubtotal)}</dd>
                      </div>
                    </dl>

                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      aria-label={`Remove ${line.name} from cart`}
                    >
                      <Trash2 aria-hidden="true" size={17} />
                    </button>
                  </fieldset>
                ))}
              </div>
            )}
          </section>

          <aside className="cart-panel order-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">Order summary</h2>
            <dl className="summary-list">
              <div>
                <dt>Base subtotal</dt>
                <dd>{money(pricing.baseSubtotal)}</dd>
              </div>
              <div>
                <dt>Quantity discount</dt>
                <dd>-{money(pricing.quantityDiscount)}</dd>
              </div>
              <div>
                <dt>Region adjustment</dt>
                <dd>{money(pricing.regionAdjustment)}</dd>
              </div>
              <div>
                <dt>Delivery fee</dt>
                <dd>{money(pricing.deliveryFee)}</dd>
              </div>
              <div>
                <dt>Estimated delivery</dt>
                <dd>{pricing.estimatedDeliveryDate}</dd>
              </div>
              <div className="summary-total">
                <dt>Total</dt>
                <dd>{money(pricing.total)}</dd>
              </div>
            </dl>

            <button
              className="submit-order-button"
              type="button"
              disabled={pricing.lines.length === 0 || pricing.hasStockIssue}
              onClick={submitOrder}
            >
              <Send aria-hidden="true" size={17} />
              Submit mock order
            </button>
          </aside>
        </div>

        {submission ? (
          <section className="workflow-output" aria-label="Workflow outputs">
            <div className="workflow-confirmation">{submission.confirmationMessage}</div>
            <div className="workflow-output-grid">
              <article>
                <h2>Confirmation email draft</h2>
                <strong>{submission.emailDraft.subject}</strong>
                <p>{submission.emailDraft.body}</p>
              </article>
              <article>
                <h2>Inventory updates</h2>
                {submission.inventoryUpdates.map((update) => (
                  <p key={update.productId}>
                    {update.name}: {update.newStock} cases remaining
                  </p>
                ))}
              </article>
              <article>
                <h2>Automation log</h2>
                <ul>
                  {submission.workflowLogs.map((log) => (
                    <li key={log.id}>
                      <span>{log.event}</span>
                      <strong>{log.status}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
