import * as Crypto from 'expo-crypto';
import { FALLBACK_DEALS, INITIAL_SHOPPING_LIST } from '@/constants/stores';
import { isSupabaseConfigured, supabase } from '@/services/supabase';
import type { Deal, PriceAlert, ShoppingItem, UserSettings } from '@/types';
import { storage } from '@/utils/storage';

const KEYS = {
  settings: 'cacapreco:settings_v1',
  deals: 'cacapreco:deals_v1',
  alerts: 'cacapreco:alerts_v1',
  shopping: 'cacapreco:shopping_v1',
};

export function newId(): string {
  return Crypto.randomUUID();
}

function defaultSettings(): UserSettings {
  return {
    deviceId: newId(),
    city: 'São Paulo - SP',
    isVip: false,
    vipPlan: null,
    savedDealIds: [],
    amazonTag: 'cacapreco-20',
    mercadoLivreTag: 'cacapreco_ml',
    shopeeTag: 'cacapreco_shp',
  };
}

const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alert-seed-1',
    keyword: 'Heineken',
    targetPrice: 4.5,
    scope: 'mercado',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-seed-2',
    keyword: 'AirFryer',
    targetPrice: 250,
    scope: 'online',
    createdAt: new Date().toISOString(),
  },
];

function rowToDeal(row: any): Deal {
  return {
    id: row.id,
    kind: row.kind === 'mercado' ? 'mercado' : 'online',
    title: row.title,
    storeName: row.store_name,
    category: row.category,
    originalPrice: Number(row.original_price ?? 0),
    dealPrice: Number(row.deal_price ?? 0),
    unit: row.unit ?? 'un',
    couponCode: row.coupon_code ?? null,
    affiliateUrl: row.affiliate_url ?? null,
    city: row.city ?? 'São Paulo - SP',
    description: row.description ?? '',
    temperature: Number(row.temperature ?? 10),
    isVipEarly: Boolean(row.is_vip_early),
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function dealToRow(d: Deal) {
  return {
    id: d.id.startsWith('seed-') ? undefined : d.id,
    kind: d.kind,
    title: d.title,
    store_name: d.storeName,
    category: d.category,
    original_price: d.originalPrice,
    deal_price: d.dealPrice,
    unit: d.unit,
    coupon_code: d.couponCode ?? null,
    affiliate_url: d.affiliateUrl ?? null,
    city: d.city,
    description: d.description,
    temperature: d.temperature,
    is_vip_early: d.isVipEarly,
  };
}

export const Database = {
  loadLocal() {
    let settings = storage.get<UserSettings | null>(KEYS.settings, null);
    if (!settings) {
      settings = defaultSettings();
      storage.set(KEYS.settings, settings);
    }
    let deals = storage.get<Deal[] | null>(KEYS.deals, null);
    if (!deals || deals.length === 0) {
      deals = FALLBACK_DEALS;
      storage.set(KEYS.deals, deals);
    }
    let alerts = storage.get<PriceAlert[] | null>(KEYS.alerts, null);
    if (!alerts) {
      alerts = DEFAULT_ALERTS;
      storage.set(KEYS.alerts, alerts);
    }
    let shopping = storage.get<ShoppingItem[] | null>(KEYS.shopping, null);
    if (!shopping) {
      shopping = INITIAL_SHOPPING_LIST;
      storage.set(KEYS.shopping, shopping);
    }
    return { settings, deals, alerts, shopping };
  },

  async fetchDeals(): Promise<{ deals: Deal[]; error: string | null }> {
    const local = storage.get<Deal[]>(KEYS.deals, FALLBACK_DEALS);
    if (!isSupabaseConfigured || !supabase) {
      return { deals: local, error: null };
    }
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(80);
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped = data.map(rowToDeal);
        storage.set(KEYS.deals, mapped);
        return { deals: mapped, error: null };
      }
      return { deals: local, error: null };
    } catch (e: any) {
      return { deals: local, error: e?.message ?? 'Modo offline ativo' };
    }
  },

  async addDeals(newDeals: Deal[], currentDeals: Deal[]): Promise<Deal[]> {
    const updated = [...newDeals, ...currentDeals];
    storage.set(KEYS.deals, updated);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('deals').insert(newDeals.map(dealToRow));
    }
    return updated;
  },

  async voteTemperature(dealId: string, delta: number, currentDeals: Deal[]): Promise<Deal[]> {
    const updated = currentDeals.map((d) =>
      d.id === dealId ? { ...d, temperature: d.temperature + delta } : d
    );
    storage.set(KEYS.deals, updated);
    const target = updated.find((d) => d.id === dealId);
    if (target && isSupabaseConfigured && supabase && !dealId.startsWith('seed-')) {
      await supabase
        .from('deals')
        .update({ temperature: target.temperature })
        .eq('id', dealId);
    }
    return updated;
  },

  saveSettings(settings: UserSettings): void {
    storage.set(KEYS.settings, settings);
  },

  saveAlerts(alerts: PriceAlert[], deviceId: string): void {
    storage.set(KEYS.alerts, alerts);
    if (isSupabaseConfigured && supabase) {
      const latest = alerts[0];
      if (latest && !latest.id.startsWith('alert-seed-')) {
        supabase
          .from('price_alerts')
          .upsert({
            id: latest.id,
            device_id: deviceId,
            keyword: latest.keyword,
            target_price: latest.targetPrice,
            scope: latest.scope,
          })
          .then(() => {});
      }
    }
  },

  saveShopping(items: ShoppingItem[]): void {
    storage.set(KEYS.shopping, items);
  },
};
