import { Room } from "@/hooks/useRoom";

/**
 * Returns true if the room has premium unlocked.
 */
export const isPremiumUnlocked = (room: Room | null): boolean => {
  return room?.premium_unlocked === true;
};

/**
 * Returns true if the given level is accessible given the room's premium status.
 * Levels 1 and 2 are free; levels 3+ require premium.
 */
export const canAccessLevel = (level: number, room: Room | null): boolean => {
  if (level <= 2) return true;
  return isPremiumUnlocked(room);
};

/**
 * Returns the display price string for the premium unlock.
 */
export const getPremiumPrice = (): string => {
  return "1,99€";
};

/**
 * Returns the price in cents for the premium unlock (used by Stripe).
 */
export const getPremiumPriceInCents = (): number => {
  return 399;
};
