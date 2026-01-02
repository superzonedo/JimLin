export interface SubscriptionState {
  isPremium: boolean;
  subscriptionType?: "1month" | "12months";
  expiresAt?: Date;
  setIsPremium: (isPremium: boolean) => void;
  setSubscription: (type: "1month" | "12months", expiresAt: Date) => void;
}

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
};
