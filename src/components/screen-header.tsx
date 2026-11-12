import { useState } from 'react';
import { Pressable, Text, TextInput, useColorScheme, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { LiveDot } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import { haptics } from '@/utils/format';

interface ScreenHeaderProps {
  /** Small uppercase pill above the title */
  eyebrow: string;
  eyebrowSf?: string;
  eyebrowMd?: string;
  liveDot?: boolean;
  /** Main title text */
  title: string;
  /** Highlighted word rendered in emerald brand tint */
  accent?: string;
  /** Dynamic subtitle below the title */
  subtitle: string;
  /** Optional primary action pill on the right */
  actionLabel?: string;
  actionSf?: string;
  actionMd?: string;
  actionTone?: 'money' | 'gold' | 'ai';
  onActionPress?: () => void;
  /** Optional search state */
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (text: string) => void;
}

export function ScreenHeader({
  eyebrow,
  eyebrowSf = 'sparkles',
  eyebrowMd = 'auto-awesome',
  liveDot = false,
  title,
  accent,
  subtitle,
  actionLabel,
  actionSf = 'plus',
  actionMd = 'add',
  actionTone = 'money',
  onActionPress,
  searchValue,
  searchPlaceholder = 'Buscar...',
  onSearchChange,
}: ScreenHeaderProps) {
  useColorScheme();
  const { colorScheme, updateSettings } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);

  const hasSearch = typeof onSearchChange === 'function';
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    haptics.tap();
    updateSettings({ themeMode: isDark ? 'light' : 'dark' });
  };

  const actionGradient =
    actionTone === 'gold'
      ? gradients.gold
      : actionTone === 'ai'
      ? gradients.ai
      : gradients.money;

  const actionTextColor = actionTone === 'gold' ? colors.onBrand : '#FFFFFF';

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          borderCurve: 'continuous',
          padding: 18,
          gap: 12,
          boxShadow: shadows.card,
          borderWidth: 1,
          borderColor: colors.separator,
          overflow: 'hidden',
        }}
      >
        {/* Top bar: Eyebrow badge on left + Icon buttons (Search & Theme) on right */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View
            style={{
              flexShrink: 1,
              minWidth: 0,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: isDark ? 'rgba(52, 211, 153, 0.14)' : 'rgba(16, 185, 129, 0.12)',
            }}
          >
            {liveDot ? (
              <LiveDot color={palette.emerald} size={7} />
            ) : (
              <Icon sf={eyebrowSf} md={eyebrowMd} size={13} color={colors.tint} />
            )}
            <Text
              numberOfLines={1}
              style={{
                flexShrink: 1,
                fontSize: 11,
                fontWeight: '800',
                letterSpacing: 0.4,
                color: colors.tint,
              }}
            >
              {eyebrow.toUpperCase()}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {hasSearch ? (
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={searchOpen ? 'Fechar busca' : 'Abrir busca'}
                onPress={() => {
                  haptics.tap();
                  if (searchOpen && searchValue) {
                    onSearchChange?.('');
                  }
                  setSearchOpen((v) => !v);
                }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 11,
                  borderCurve: 'continuous',
                  backgroundColor: searchOpen ? palette.emeraldDeep : colors.fill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  sf={searchOpen ? 'xmark' : 'magnifyingglass'}
                  md={searchOpen ? 'close' : 'search'}
                  size={16}
                  color={searchOpen ? '#FFFFFF' : colors.label}
                />
              </PressableScale>
            ) : null}

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              onPress={toggleTheme}
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                borderCurve: 'continuous',
                backgroundColor: colors.fill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                sf={isDark ? 'sun.max.fill' : 'moon.fill'}
                md={isDark ? 'light-mode' : 'dark-mode'}
                size={16}
                color={isDark ? palette.gold : colors.label}
              />
            </PressableScale>
          </View>
        </View>

        {/* Main Row: Title + Subtitle on left, Action Pill aligned cleanly on right */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 24,
                fontWeight: '900',
                letterSpacing: -0.6,
                lineHeight: 29,
                color: colors.label,
              }}
            >
              {title}
              {accent ? <Text style={{ color: colors.tint }}> {accent}</Text> : null}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 13, fontWeight: '500', color: colors.secondaryLabel }}
            >
              {subtitle}
            </Text>
          </View>

          {actionLabel && onActionPress ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              containerStyle={{ flexShrink: 0 }}
              onPress={() => {
                haptics.tap();
                onActionPress();
              }}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 13,
                  height: 38,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                },
                gradientBg(actionGradient),
              ]}
            >
              <Icon sf={actionSf} md={actionMd} size={14} color={actionTextColor} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: actionTextColor }}>
                {actionLabel}
              </Text>
            </PressableScale>
          ) : null}
        </View>

        {/* Expandable Search Input */}
        {hasSearch && (searchOpen || Boolean(searchValue)) ? (
          <Animated.View
            entering={FadeInDown.duration(180)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.fill,
              borderRadius: 14,
              borderCurve: 'continuous',
              paddingHorizontal: 12,
              minHeight: 44,
            }}
          >
            <Icon sf="magnifyingglass" md="search" size={16} color={colors.secondaryLabel} />
            <TextInput
              autoFocus={searchOpen}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.secondaryLabel as string}
              value={searchValue}
              onChangeText={onSearchChange}
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 15,
                color: colors.label,
                paddingVertical: 8,
              }}
            />
            {searchValue ? (
              <Pressable
                onPress={() => onSearchChange?.('')}
                hitSlop={8}
                style={{ padding: 4 }}
              >
                <Icon sf="xmark.circle.fill" md="cancel" size={16} color={colors.secondaryLabel} />
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
