import { type ColorValue, type ViewStyle } from 'react-native';

let activeScheme: 'light' | 'dark' = 'light';

export function setActiveColorScheme(scheme: 'light' | 'dark') {
  activeScheme = scheme;
}

export function getActiveColorScheme(): 'light' | 'dark' {
  return activeScheme;
}

const lightColors = {
  label: '#0F172A' as ColorValue,
  secondaryLabel: '#475569' as ColorValue,
  tertiaryLabel: '#94A3B8' as ColorValue,
  separator: '#E2E8F0' as ColorValue,
  background: '#F2F4F7' as ColorValue,
  card: '#FFFFFF' as ColorValue,
  fill: '#EEF0F4' as ColorValue,
  tint: '#059669' as ColorValue,
  onTint: '#FFFFFF' as ColorValue,
  success: '#059669' as ColorValue,
  warning: '#D97706' as ColorValue,
  danger: '#DC2626' as ColorValue,
  purple: '#7C3AED' as ColorValue,
  whatsapp: '#25D366' as ColorValue,
  brand: '#FBBF24' as ColorValue,
  onBrand: '#1F1300' as ColorValue,
  hot: '#FF5A1F' as ColorValue,
};

const darkColors: typeof lightColors = {
  label: '#F8FAFC',
  secondaryLabel: '#94A3B8',
  tertiaryLabel: '#64748B',
  separator: '#1E293B',
  background: '#090D16',
  card: '#111827',
  fill: '#1E293B',
  tint: '#34D399',
  onTint: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  purple: '#A78BFA',
  whatsapp: '#25D366',
  brand: '#FBBF24',
  onBrand: '#1F1300',
  hot: '#FF5A1F',
};

/**
 * Reactive semantic palette that adapts automatically to 'light', 'dark',
 * or 'system' preference across iOS, Android, and Web.
 */
export const colors: typeof lightColors = {
  get label() {
    return (activeScheme === 'dark' ? darkColors : lightColors).label;
  },
  get secondaryLabel() {
    return (activeScheme === 'dark' ? darkColors : lightColors).secondaryLabel;
  },
  get tertiaryLabel() {
    return (activeScheme === 'dark' ? darkColors : lightColors).tertiaryLabel;
  },
  get separator() {
    return (activeScheme === 'dark' ? darkColors : lightColors).separator;
  },
  get background() {
    return (activeScheme === 'dark' ? darkColors : lightColors).background;
  },
  get card() {
    return (activeScheme === 'dark' ? darkColors : lightColors).card;
  },
  get fill() {
    return (activeScheme === 'dark' ? darkColors : lightColors).fill;
  },
  get tint() {
    return (activeScheme === 'dark' ? darkColors : lightColors).tint;
  },
  get onTint() {
    return (activeScheme === 'dark' ? darkColors : lightColors).onTint;
  },
  get success() {
    return (activeScheme === 'dark' ? darkColors : lightColors).success;
  },
  get warning() {
    return (activeScheme === 'dark' ? darkColors : lightColors).warning;
  },
  get danger() {
    return (activeScheme === 'dark' ? darkColors : lightColors).danger;
  },
  get purple() {
    return (activeScheme === 'dark' ? darkColors : lightColors).purple;
  },
  get whatsapp() {
    return lightColors.whatsapp;
  },
  get brand() {
    return lightColors.brand;
  },
  get onBrand() {
    return lightColors.onBrand;
  },
  get hot() {
    return lightColors.hot;
  },
};

/**
 * Static brand palette. Safe to use inside Reanimated styles and gradients.
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
