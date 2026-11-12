const memoryStore = new Map<string, string>();

try {
  // Optional install of expo-sqlite localStorage polyfill when native module is present
  require('expo-sqlite/localStorage/install');
} catch {
  // Fallback to in-memory or existing globalThis.localStorage
}

function getRawItem(key: string): string | null {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      return globalThis.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return memoryStore.get(key) ?? null;
}

function setRawItem(key: string, value: string): void {
  memoryStore.set(key, value);
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

function removeRawItem(key: string): void {
  memoryStore.delete(key);
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

/**
 * Key-value storage backed by expo-sqlite's localStorage polyfill
 * with automatic fallback so it works seamlessly in Expo Go, Android, iOS, and Web.
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const raw = getRawItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    setRawItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    removeRawItem(key);
  },
};

/** Adapter used by supabase-js to persist auth sessions. */
export const supabaseAuthStorage = {
  getItem: (key: string) => getRawItem(key),
  setItem: (key: string, value: string) => setRawItem(key, value),
  removeItem: (key: string) => removeRawItem(key),
};
