export type DealKind = 'online' | 'mercado';

export interface Deal {
  id: string;
  kind: DealKind;
  title: string;
  storeName: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  unit: string;
  couponCode?: string | null;
  affiliateUrl?: string | null;
  city: string;
  description: string;
  temperature: number;
  /** Early access / bug de preço exclusive to VIP subscribers */
  isVipEarly: boolean;
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  keyword: string;
  targetPrice: number;
  scope: 'ambos' | 'online' | 'mercado';
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface UserSettings {
  deviceId: string;
  city: string;
  isVip: boolean;
  vipPlan: 'mensal' | 'anual' | null;
  savedDealIds: string[];
  /** Theme preference: 'system' (igual ao sistema), 'light' (claro), or 'dark' (escuro) */
  themeMode?: ThemeMode;
  /** Affiliate tags so the app owner earns commissions on every click */
  amazonTag: string;
  mercadoLivreTag: string;
  shopeeTag: string;
}

export interface StoreMeta {
  name: string;
  kind: DealKind;
  color: string;
  sf: string;
  md: string;
}
