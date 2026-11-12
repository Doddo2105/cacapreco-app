import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { FREE_ALERTS_LIMIT } from '@/constants/stores';
import { Database, newId } from '@/services/database';
import { setActiveColorScheme } from '@/theme/colors';
import type { Deal, PriceAlert, ShoppingItem, UserSettings } from '@/types';

export interface StoreBasketRanking {
  storeName: string;
  matchedCount: number;
  totalItems: number;
  totalPrice: number;
  totalSavings: number;
}

export interface ShoppingMatchedItem extends ShoppingItem {
  bestDeal?: Deal;
}

interface DealsStore {
  settings: UserSettings;
  colorScheme: 'light' | 'dark';
  deals: Deal[];
  onlineDeals: Deal[];
  marketDeals: Deal[];
  alerts: PriceAlert[];
  matchedAlerts: { alert: PriceAlert; deals: Deal[] }[];
  shoppingList: ShoppingMatchedItem[];
  storeRankings: StoreBasketRanking[];
  isLoading: boolean;
  syncError: string | null;
  canAddAlert: boolean;
  getDeal: (id: string) => Deal | undefined;
  refresh: () => Promise<void>;
  addDeals: (newDeals: Deal[]) => Promise<void>;
  voteDeal: (id: string, delta: number) => Promise<void>;
  toggleSavedDeal: (id: string) => void;
  addAlert: (keyword: string, targetPrice: number, scope: PriceAlert['scope']) => void;
  removeAlert: (id: string) => void;
  addShoppingItem: (name: string, quantity: number, unit?: string) => void;
  toggleShoppingItem: (id: string) => void;
  changeShoppingQty: (id: string, delta: number) => void;
  removeShoppingItem: (id: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
}

const DealsContext = createContext<DealsStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [initial] = useState(() => Database.loadLocal());
  const [settings, setSettings] = useState<UserSettings>(() => ({
    themeMode: 'system',
    ...initial.settings,
  }));
  const [deals, setDeals] = useState<Deal[]>(initial.deals);
  const [alerts, setAlerts] = useState<PriceAlert[]>(initial.alerts);
  const [shopping, setShopping] = useState<ShoppingItem[]>(initial.shopping);
  const [isLoading, setIsLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const themeMode = settings.themeMode ?? 'system';
  const colorScheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;

  // Keep semantic colors in sync before children render
  setActiveColorScheme(colorScheme);

  useEffect(() => {
    if (process.env.EXPO_OS !== 'web') {
      try {
        Appearance.setColorScheme?.(themeMode === 'system' ? 'unspecified' : themeMode);
      } catch {
        // ignore if unsupported in current runtime
      }
    }
  }, [themeMode]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const { deals: fetched, error } = await Database.fetchDeals();
    setDeals(fetched);
    setSyncError(error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDeals = useCallback(
    async (created: Deal[]) => {
      const updated = await Database.addDeals(created, deals);
      setDeals(updated);
    },
    [deals]
  );

  const voteDeal = useCallback(
    async (id: string, delta: number) => {
      const updated = await Database.voteTemperature(id, delta, deals);
      setDeals(updated);
    },
    [deals]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      Database.saveSettings(next);
    },
    [settings]
  );

  const toggleSavedDeal = useCallback(
    (id: string) => {
      const exists = settings.savedDealIds.includes(id);
      const savedDealIds = exists
        ? settings.savedDealIds.filter((x) => x !== id)
        : [id, ...settings.savedDealIds];
      updateSettings({ savedDealIds });
    },
    [settings.savedDealIds, updateSettings]
  );

  const addAlert = useCallback(
    (keyword: string, targetPrice: number, scope: PriceAlert['scope']) => {
      const next: PriceAlert[] = [
        {
          id: newId(),
          keyword: keyword.trim(),
          targetPrice,
          scope,
          createdAt: new Date().toISOString(),
        },
        ...alerts,
      ];
      setAlerts(next);
      Database.saveAlerts(next, settings.deviceId);
    },
    [alerts, settings.deviceId]
  );

  const removeAlert = useCallback(
    (id: string) => {
      const next = alerts.filter((a) => a.id !== id);
      setAlerts(next);
      Database.saveAlerts(next, settings.deviceId);
    },
    [alerts, settings.deviceId]
  );

  const addShoppingItem = useCallback(
    (name: string, quantity: number, unit = 'un') => {
      const next: ShoppingItem[] = [
        { id: newId(), name: name.trim(), quantity: Math.max(1, quantity), unit, checked: false },
        ...shopping,
      ];
      setShopping(next);
      Database.saveShopping(next);
    },
    [shopping]
  );

  const toggleShoppingItem = useCallback(
    (id: string) => {
      const next = shopping.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      setShopping(next);
      Database.saveShopping(next);
    },
    [shopping]
  );

  const changeShoppingQty = useCallback(
    (id: string, delta: number) => {
      const next = shopping.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      );
      setShopping(next);
      Database.saveShopping(next);
    },
    [shopping]
  );

  const removeShoppingItem = useCallback(
    (id: string) => {
      const next = shopping.filter((item) => item.id !== id);
      setShopping(next);
      Database.saveShopping(next);
    },
    [shopping]
  );

  const value = useMemo<DealsStore>(() => {
    const onlineDeals = deals.filter((d) => d.kind === 'online');
    const marketDeals = deals.filter((d) => d.kind === 'mercado');

    // Match each shopping item with the lowest-priced deal whose title matches keywords
    const findBestDealsForKeyword = (kw: string, pool: Deal[]) => {
      const words = kw
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);
      if (words.length === 0) return [];
      return pool
        .filter((d) => words.some((w) => d.title.toLowerCase().includes(w)))
        .sort((a, b) => a.dealPrice - b.dealPrice);
    };

    const shoppingList: ShoppingMatchedItem[] = shopping.map((item) => {
      const matches = findBestDealsForKeyword(item.name, deals);
      return {
        ...item,
        bestDeal: matches[0],
      };
    });

    // Rank supermarkets by total basket cost
    const marketStores = Array.from(new Set(marketDeals.map((d) => d.storeName)));
    const storeRankings: StoreBasketRanking[] = marketStores
      .map((storeName) => {
        const storeDeals = marketDeals.filter((d) => d.storeName === storeName);
        let matchedCount = 0;
        let totalPrice = 0;
        let totalSavings = 0;

        for (const item of shopping) {
          const matches = findBestDealsForKeyword(item.name, storeDeals);
          if (matches.length > 0) {
            matchedCount += 1;
            const d = matches[0];
            totalPrice += d.dealPrice * item.quantity;
            totalSavings += Math.max(0, d.originalPrice - d.dealPrice) * item.quantity;
          } else {
            // Fallback to best overall market deal so baskets remain comparable
            const fallback = findBestDealsForKeyword(item.name, marketDeals)[0];
            if (fallback) {
              totalPrice += fallback.originalPrice * item.quantity;
            }
          }
        }

        return {
          storeName,
          matchedCount,
          totalItems: shopping.length,
          totalPrice,
          totalSavings,
        };
      })
      .sort((a, b) => a.totalPrice - b.totalPrice);

    // Match price alerts against live deals
    const matchedAlerts = alerts.map((alert) => {
      const pool =
        alert.scope === 'online'
          ? onlineDeals
          : alert.scope === 'mercado'
          ? marketDeals
          : deals;
      const matches = findBestDealsForKeyword(alert.keyword, pool).filter(
        (d) => d.dealPrice <= alert.targetPrice
      );
      return { alert, deals: matches };
    });

    return {
      settings,
      colorScheme,
      deals,
      onlineDeals,
      marketDeals,
      alerts,
      matchedAlerts,
      shoppingList,
      storeRankings,
      isLoading,
      syncError,
      canAddAlert: settings.isVip || alerts.length < FREE_ALERTS_LIMIT,
      getDeal: (id) => deals.find((d) => d.id === id),
      refresh,
      addDeals,
      voteDeal,
      toggleSavedDeal,
      addAlert,
      removeAlert,
      addShoppingItem,
      toggleShoppingItem,
      changeShoppingQty,
      removeShoppingItem,
      updateSettings,
    };
  }, [
    settings,
    colorScheme,
    deals,
    alerts,
    shopping,
    isLoading,
    syncError,
    refresh,
    addDeals,
    voteDeal,
    toggleSavedDeal,
    addAlert,
    removeAlert,
    addShoppingItem,
    toggleShoppingItem,
    changeShoppingQty,
    removeShoppingItem,
    updateSettings,
  ]);

  return <DealsContext value={value}>{children}</DealsContext>;
}

export function useApp(): DealsStore {
  const ctx = use(DealsContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
