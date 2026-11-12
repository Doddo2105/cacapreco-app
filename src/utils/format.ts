export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcDiscountPercent(original: number, deal: number): number {
  if (original <= 0 || deal >= original) return 0;
  return Math.round(((original - deal) / original) * 100);
}

export function formatRelativeTime(iso: string): string {
  const diffMin = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `há ${diffDays}d`;
}

export function parseNumber(input: string): number {
  const n = Number(input.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function buildAffiliateLink(
  rawUrl: string | null | undefined,
  storeName: string,
  tags: { amazonTag: string; mercadoLivreTag: string; shopeeTag: string }
): string {
  const base = rawUrl?.trim() || 'https://www.google.com/search?q=' + encodeURIComponent(storeName);
  const sep = base.includes('?') ? '&' : '?';
  const lower = storeName.toLowerCase();
  if (lower.includes('amazon') && tags.amazonTag) {
    return `${base}${sep}tag=${encodeURIComponent(tags.amazonTag)}`;
  }
  if (lower.includes('mercado') && tags.mercadoLivreTag) {
    return `${base}${sep}matt_tool=${encodeURIComponent(tags.mercadoLivreTag)}`;
  }
  if (lower.includes('shopee') && tags.shopeeTag) {
    return `${base}${sep}af_id=${encodeURIComponent(tags.shopeeTag)}`;
  }
  return base;
}

export const haptics = {
  tap() {
    if (process.env.EXPO_OS === 'ios') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.selectionAsync?.();
      } catch {}
    }
  },
  success() {
    if (process.env.EXPO_OS === 'ios') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Success);
      } catch {}
    }
  },
  warning() {
    if (process.env.EXPO_OS === 'ios') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.notificationAsync?.(Haptics.NotificationFeedbackType?.Warning);
      } catch {}
    }
  },
};

/** Copies text to the clipboard; resolves false if the platform refuses. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const Clipboard = require('expo-clipboard');
    if (Clipboard?.setStringAsync) {
      await Clipboard.setStringAsync(text);
      return true;
    }
  } catch {
    // Fallback to navigator.clipboard if available
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  return true;
}
