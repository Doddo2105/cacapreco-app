import 'expo-sqlite/localStorage/install';

/**
 * Key-value storage backed by expo-sqlite's localStorage polyfill
 * (recommended by the expo-native-ui skill instead of AsyncStorage).
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

/** Adapter used by supabase-js to persist auth sessions. */
export const supabaseAuthStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};
