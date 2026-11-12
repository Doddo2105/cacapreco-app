import { DynamicColorIOS, Platform, type ColorValue, type ViewStyle } from 'react-native';
import { Color } from 'expo-router';

/** DynamicColorIOS throws off iOS, so it can't sit inside Platform.select. */
const emeraldText: ColorValue =
  process.env.EXPO_OS === 'ios'
    ? DynamicColorIOS({ light: '#047857', dark: '#34D399' })
    : '#059669';

/**
 * Neutrals (text, surfaces, separators) use the native semantic palette so
 * they adapt to light/dark mode on-device. Brand colors are intentionally
 * static and vivid — emerald for money/savings, hot orange for urgency,
 * gold for VIP — so the app looks like CaçaPreço instead of the wallpaper.
 * Remember to call `useColorScheme()` in components that render these so
 * Android re-renders when the theme flips.
 */
export const colors = {
  label: Platform.select({
    ios: Color.ios.label,
    android: Color.android.dynamic.onSurface,
    default: '#0F172A',
  })!,
  secondaryLabel: Platform.select({
    ios: Color.ios.secondaryLabel,
    android: Color.android.dynamic.onSurfaceVariant,
    default: '#475569',
  })!,
  tertiaryLabel: Platform.select({
    ios: Color.ios.tertiaryLabel,
    android: Color.android.dynamic.outline,
    default: '#94A3B8',
  })!,
  separator: Platform.select({
    ios: Color.ios.separator,
    android: Color.android.dynamic.outlineVariant,
    default: '#E2E8F0',
  })!,
  /** Screen background (grouped style) */
  background: Platform.select({
    ios: Color.ios.systemGroupedBackground,
    android: Color.android.dynamic.surface,
    default: '#F2F2F7',
  })!,
  /** Cards / grouped rows */
  card: Platform.select({
    ios: Color.ios.secondarySystemGroupedBackground,
    android: Color.android.dynamic.surfaceContainerLow,
    default: '#FFFFFF',
  })!,
  /** Inputs, chips, subtle fills */
  fill: Platform.select({
    ios: Color.ios.tertiarySystemFill,
    android: Color.android.dynamic.surfaceContainerHighest,
    default: '#EEF0F4',
  })!,
  /** Interactive / brand tint: emerald, readable on both light and dark surfaces */
  tint: emeraldText,
  onTint: '#FFFFFF',
  /** Prices and savings — same emerald so "green = money you keep" everywhere */
  success: emeraldText,
  warning: Platform.select({
    ios: Color.ios.systemOrange,
    android: '#B26A00',
    default: '#D97706',
  })!,
  danger: Platform.select({
    ios: Color.ios.systemRed,
    android: Color.android.dynamic.error,
    default: '#DC2626',
  })!,
  purple: Platform.select({
    ios: Color.ios.systemPurple,
    android: '#7E57C2',
    default: '#7C3AED',
  })!,
  /** WhatsApp brand green – intentionally static */
  whatsapp: '#25D366',
  /** VIP gold accent – intentionally static */
  brand: '#FBBF24',
  onBrand: '#1F1300',
  /** Hot / urgency accent (temperature, discount badges) */
  hot: '#FF5A1F',
};

/**
 * Static brand palette. Safe to use inside Reanimated styles and gradients
 * (the semantic colors above are opaque native objects and are not).
 */
export const palette = {
  emerald: '#10B981',
  emeraldDeep: '#047857',
  emeraldDark: '#064E3B',
  mint: '#6EE7B7',
  lime: '#BEF264',
  hot: '#FF5A1F',
  hotDeep: '#F43F5E',
  gold: '#FBBF24',
  goldDeep: '#F59E0B',
  violet: '#8B5CF6',
  violetDeep: '#4F46E5',
  night: '#0B1F1A',
  white: '#FFFFFF',
};

export const gradients = {
  /** Savings / primary actions */
  money: `linear-gradient(135deg, ${palette.emerald} 0%, ${palette.emeraldDeep} 100%)`,
  /** Dark premium hero with a green glow */
  moneyHero: `radial-gradient(circle at top right, rgba(190, 242, 100, 0.35) 0%, rgba(190, 242, 100, 0) 55%), linear-gradient(140deg, #059669 0%, ${palette.emeraldDark} 100%)`,
  /** Discounts, temperature, urgency */
  hot: `linear-gradient(135deg, #FF8A00 0%, ${palette.hotDeep} 100%)`,
  /** VIP */
  gold: `linear-gradient(135deg, #FDE047 0%, ${palette.goldDeep} 100%)`,
  vipHero: `radial-gradient(circle at top right, rgba(251, 191, 36, 0.45) 0%, rgba(251, 191, 36, 0) 60%), linear-gradient(150deg, #1E1B4B 0%, ${palette.night} 100%)`,
  /** AI features */
  ai: `linear-gradient(135deg, ${palette.violet} 0%, ${palette.violetDeep} 100%)`,
};

export const shadows = {
  card: '0 1px 2px rgba(6, 78, 59, 0.06), 0 6px 16px rgba(6, 78, 59, 0.06)',
  money: '0 8px 20px rgba(5, 150, 105, 0.35)',
  hot: '0 6px 14px rgba(244, 63, 94, 0.32)',
  gold: '0 8px 20px rgba(245, 158, 11, 0.35)',
  ai: '0 8px 20px rgba(79, 70, 229, 0.32)',
};

export type AppColor = (typeof colors)[keyof typeof colors];


/** Solid color shown if a platform can't paint the gradient, so text stays readable. */
const gradientFallback: Record<string, string> = {
  [gradients.money]: palette.emeraldDeep,
  [gradients.moneyHero]: palette.emeraldDeep,
  [gradients.hot]: palette.hot,
  [gradients.gold]: palette.gold,
  [gradients.vipHero]: '#1E1B4B',
  [gradients.ai]: palette.violetDeep,
};

/**
 * Gradient background style. Native uses React Native's CSS gradients
 * (New Architecture); web uses the regular CSS property.
 */
export function gradientBg(gradient: string): ViewStyle {
  const fallback = gradientFallback[gradient];
  const image =
    process.env.EXPO_OS === 'web'
      ? { backgroundImage: gradient }
      : { experimental_backgroundImage: gradient };
  return { ...(fallback ? { backgroundColor: fallback } : null), ...image } as ViewStyle;
}
