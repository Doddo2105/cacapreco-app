import { Text, useColorScheme, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { colors, palette } from '@/theme/colors';
import { haptics } from '@/utils/format';

const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  /** Fill color when selected (defaults to brand emerald) */
  activeColor?: string;
  sf?: string;
  md?: string;
  /** Icon color while unselected */
  iconColor?: string;
}

/**
 * Filter pill. The selected fill crossfades in over the neutral surface
 * (opacity only), so switching filters feels smooth without a layout pass.
 */
export function FilterChip({
  label,
  active,
  onPress,
  activeColor = palette.emeraldDeep,
  sf,
  md,
  iconColor,
}: FilterChipProps) {
  useColorScheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      hitSlop={4}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: colors.card,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: activeColor,
          opacity: active ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: '180ms',
          transitionTimingFunction: EASE_OUT,
        }}
      />
      {sf && md ? (
        <Icon sf={sf} md={md} size={13} color={active ? '#FFFFFF' : iconColor ?? activeColor} />
      ) : null}
      <View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: active ? '#FFFFFF' : colors.label,
          }}
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}
