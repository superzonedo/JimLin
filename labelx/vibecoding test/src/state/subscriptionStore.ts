import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SubscriptionState } from "../types/subscription";
import {
  getCustomerInfo,
  getOfferings,
  restorePurchases,
} from "../lib/revenuecatClient";
import type { PurchasesOfferings, CustomerInfo } from "react-native-purchases";

// Helper function to parse subscription type from product identifier
function parseSubscriptionType(productIdentifier: string): "1month" | "12months" | undefined {
  if (productIdentifier.includes('1month') || productIdentifier.includes('monthly')) return '1month';
  if (productIdentifier.includes('12month') || productIdentifier.includes('yearly') || productIdentifier.includes('annual')) return '12months';
  return undefined;
}

// Helper function to get expiration date from customer info
function getExpirationDate(customerInfo: CustomerInfo): Date | undefined {
  const premiumEntitlement = customerInfo.entitlements.active["premium"];
  if (premiumEntitlement && premiumEntitlement.expirationDate) {
    return new Date(premiumEntitlement.expirationDate);
  }
  return undefined;
}

interface ExtendedSubscriptionState extends SubscriptionState {
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  customerInfo: CustomerInfo | null;
  lastSyncTime: number | null;
  
  // Actions
  syncFromRevenueCat: () => Promise<void>;
  fetchOfferings: () => Promise<void>;
  handlePurchaseSuccess: (customerInfo: CustomerInfo) => void;
  handleRestorePurchases: () => Promise<{ success: boolean; hasActiveSubscription: boolean }>;
  clearSubscriptionData: () => void;
}

export const useSubscriptionStore = create<ExtendedSubscriptionState>()(
  persist(
    (set, get) => ({
      // State
      isPremium: false,
      subscriptionType: undefined,
      expiresAt: undefined,
      isLoading: false,
      offerings: null,
      customerInfo: null,
      lastSyncTime: null,
      
      // Legacy actions (keep for compatibility)
      setIsPremium: (isPremium) => set({ isPremium }),
      setSubscription: (type, expiresAt) =>
        set({
          isPremium: true,
          subscriptionType: type,
          expiresAt,
        }),
      
      // New RevenueCat actions
      syncFromRevenueCat: async () => {
        try {
          set({ isLoading: true });

          const result = await getCustomerInfo();

          if (!result.ok) {
            set({
              isPremium: false,
              subscriptionType: undefined,
              expiresAt: undefined,
              customerInfo: null,
              isLoading: false,
            });
            return;
          }

          const customerInfo = result.data;

          // Check if user has active "premium" entitlement
          const hasPremiumEntitlement = customerInfo.entitlements.active["premium"] !== undefined;

          if (hasPremiumEntitlement) {
            const premiumEntitlement = customerInfo.entitlements.active["premium"];
            const productId = premiumEntitlement.productIdentifier;
            const subscriptionType = parseSubscriptionType(productId);
            const expiresAt = getExpirationDate(customerInfo);

            set({
              isPremium: true,
              subscriptionType,
              expiresAt,
              customerInfo,
              lastSyncTime: Date.now(),
              isLoading: false,
            });
          } else {
            set({
              isPremium: false,
              subscriptionType: undefined,
              expiresAt: undefined,
              customerInfo,
              lastSyncTime: Date.now(),
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Failed to sync from RevenueCat:", error);
          set({ isLoading: false });
        }
      },
      
      fetchOfferings: async () => {
        try {
          set({ isLoading: true });

          const result = await getOfferings();

          set({
            offerings: result.ok ? result.data : null,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch offerings:", error);
          set({ isLoading: false });
        }
      },
      
      handlePurchaseSuccess: (customerInfo) => {
        const hasPremiumEntitlement = customerInfo.entitlements.active["premium"] !== undefined;

        if (hasPremiumEntitlement) {
          const premiumEntitlement = customerInfo.entitlements.active["premium"];
          const productId = premiumEntitlement.productIdentifier;
          const subscriptionType = parseSubscriptionType(productId);
          const expiresAt = getExpirationDate(customerInfo);

          set({
            isPremium: true,
            subscriptionType,
            expiresAt,
            customerInfo,
            lastSyncTime: Date.now(),
          });
        }
      },
      
      handleRestorePurchases: async () => {
        try {
          set({ isLoading: true });

          const result = await restorePurchases();

          if (result.ok) {
            const customerInfo = result.data;
            get().handlePurchaseSuccess(customerInfo);

            const hasActiveSubscription = Object.keys(customerInfo.entitlements.active || {}).length > 0;

            set({ isLoading: false });

            return {
              success: true,
              hasActiveSubscription,
            };
          } else {
            set({ isLoading: false });
            return { success: false, hasActiveSubscription: false };
          }
        } catch (error) {
          console.error("Failed to restore purchases:", error);
          set({ isLoading: false });
          return { success: false, hasActiveSubscription: false };
        }
      },
      
      clearSubscriptionData: () => {
        set({
          isPremium: false,
          subscriptionType: undefined,
          expiresAt: undefined,
          offerings: null,
          customerInfo: null,
          lastSyncTime: null,
        });
      },
    }),
    {
      name: "subscription-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist basic subscription data, not offerings/customerInfo
      partialize: (state) => ({
        isPremium: state.isPremium,
        subscriptionType: state.subscriptionType,
        expiresAt: state.expiresAt,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

