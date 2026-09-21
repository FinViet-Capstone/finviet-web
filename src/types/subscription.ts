export interface SubscriptionPlan {
  planId: string;
  name: string;
  price: number;
  billingIntervalMonths: number;
  features: string[];
  isActive: boolean;
}

export interface SubscriptionCheckout {
  paymentId: string;
  redirectUrl: string;
  amount: number;
  expiresAt: string;
}

export interface SubscriptionPayment {
  paymentId: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  amount: number;
  subscriptionId: string | null;
}

export interface CurrentSubscription {
  subscriptionId: string;
  planId: string | null;
  planName: string;
  status: string;
  lockedPrice: number;
  nextBillingDate: string | null;
}

export interface CheckoutAttempt {
  planId: string;
  key: string;
  checkout?: SubscriptionCheckout;
}

export function isVNPayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["sandbox.vnpayment.vn", "pay.vnpay.vn"].includes(url.hostname);
  } catch { return false; }
}
