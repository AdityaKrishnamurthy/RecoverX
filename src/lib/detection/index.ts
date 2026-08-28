import { classifyPaymentFailure } from "./payment-retry";
import { classifyCheckoutAbandonment } from "./checkout-abandonment";
import { classifySubscriptionFailure } from "./subscription-failure";
import { classifyReceivableAging } from "./receivable-overdue";

export * from "./payment-retry";
export * from "./checkout-abandonment";
export * from "./subscription-failure";
export * from "./receivable-overdue";

export function preclassifyCase(type: string, payload: Record<string, unknown>, amount: number) {
  switch (type) {
    case "PAYMENT_RETRY":
      return { type, ...classifyPaymentFailure(payload) };
    case "CHECKOUT_ABANDONMENT":
      return { type, ...classifyCheckoutAbandonment(payload, amount) };
    case "SUBSCRIPTION_FAILURE":
      return { type, ...classifySubscriptionFailure(payload) };
    case "RECEIVABLE_OVERDUE":
      return { type, ...classifyReceivableAging(payload, amount) };
    default:
      return { type, unclassified: true };
  }
}
