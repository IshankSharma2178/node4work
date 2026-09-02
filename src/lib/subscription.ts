import { polarClient } from "@/lib/polar";

export const isActiveSubscriber = async (userId: string): Promise<boolean> => {
  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });

    return Boolean(
      customer.activeSubscriptions && customer.activeSubscriptions.length > 0,
    );
  } catch (error) {
    console.warn("[subscription] failed to fetch customer state:", error);
    return false;
  }
};
