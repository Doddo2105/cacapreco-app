import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, View } from 'react-native';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { gradientBg, gradients, shadows } from '@/theme/colors';

type Tone = 'money' | 'hot' | 'gold' | 'ai';

const TONES: Record<Tone, { gradient: string; shadow: string; text: string }> = {
  money: { gradient: gradients.money, shadow: shadows.money, text: '#FFFFFF' },
  hot: { gradient: gradients.hot, shadow: shadows.hot, text: '#FFFFFF' },
  gold: { gradient: gradients.gold, shadow: shadows.gold, text: '#1F1300' },
  ai: { gradient: gradients.ai, shadow: shadows.ai, text: '#FFFFFF' },
};

interface GradientButtonProps {
  label: string;
  sublabel?: string;
  tone?: Tone;
  sf?: string;
  md?: string;
  size?: 'md' | 'lg';
  loading?: boolean;
  onPress: (e: GestureResponderEvent) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Primary call-to-action: vivid gradient, colored glow, press scale. */
export function GradientButton({
  label,
  sublabel,
  tone = 'money',
  sf,
  md,
  size = 'md',
  loading = false,
  onPress,
  containerStyle,
}: GradientButtonProps) {
  const t = TONES[tone];
  const lg = size === 'lg';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      onPress={(e) => {
        // When nested in a card that is a link, web would otherwise follow the href.
        e.preventDefault();
        onPress(e);
      }}
      containerStyle={containerStyle}
      style={[
        {
          minHeight: lg ? 54 : 44,
          paddingHorizontal: 16,
          paddingVertical: lg ? 12 : 10,
          borderRadius: lg ? 16 : 13,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          boxShadow: t.shadow,
        },
        gradientBg(t.gradient),
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        {loading ? (
          <ActivityIndicator color={t.text} size="small" />
        ) : sf && md ? (
          <Icon sf={sf} md={md} size={lg ? 19 : 16} color={t.text} weight="bold" />
        ) : null}
        <Text
          numberOfLines={1}
          style={{ fontSize: lg ? 16 : 14, fontWeight: '800', color: t.text, flexShrink: 1 }}
        >
          {label}
        </Text>
      </View>
      {sublabel ? (
        <Text style={{ fontSize: 11, fontWeight: '600', color: t.text, opacity: 0.85 }}>
          {sublabel}
        </Text>
      ) : null}
    </PressableScale>
  );
}
