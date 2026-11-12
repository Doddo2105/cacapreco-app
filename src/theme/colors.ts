import { Platform } from 'react-native';
import { Color } from 'expo-router';

/**
 * Native semantic palette (iOS UIKit colors / Android Material 3 dynamic colors).
 * Resolves on-device and adapts automatically to light/dark mode.
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
  tint: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.primary,
    default: '#007AFF',
  })!,
  onTint: Platform.select({
    ios: '#FFFFFF',
    android: Color.android.dynamic.onPrimary,
    default: '#FFFFFF',
  })!,
  tintContainer: Platform.select({
    ios: Color.ios.secondarySystemFill,
    android: Color.android.dynamic.primaryContainer,
    default: '#E0ECFF',
  })!,
  onTintContainer: Platform.select({
    ios: Color.ios.systemBlue,
    android: Color.android.dynamic.onPrimaryContainer,
    default: '#0A3D91',
  })!,
  success: Platform.select({
    ios: Color.ios.systemGreen,
    android: '#1E8E3E',
    default: '#16A34A',
  })!,
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
  /** OrçaPro brand / PRO accent – intentionally static */
  brand: '#F59E0B',
  onBrand: '#1F1300',
};

export type AppColor = (typeof colors)[keyof typeof colors];
