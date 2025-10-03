import { StorageKey } from "../types";

export const storageService = {
  get: <T>(key: StorageKey, userId?: string): T | null => {
    try {
      const storageKey = userId ? `${key}_${userId}` : key;
      const item = sessionStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  set: <T>(key: StorageKey, value: T, userId?: string): void => {
    try {
      const storageKey = userId ? `${key}_${userId}` : key;
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },

  remove: (key: StorageKey, userId?: string): void => {
    try {
      const storageKey = userId ? `${key}_${userId}` : key;
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  },

  clear: (): void => {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  },
};
