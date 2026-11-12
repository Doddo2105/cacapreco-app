import { Text, View } from 'react-native';
import { Icon } from '@/components/icon';
import { Pulse } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { gradientBg, gradients, shadows } from '@/theme/colors';

interface AiBannerProps {
  title: string;
  subtitle: string;
  sf: string;
  md: string;
  onPress: () => void;
}

/** Violet = AI everywhere in the app. Entry point to the Gemini importer. */
export function AiBanner({ title, subtitle, sf, md, onPress }: AiBannerProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={[
        {
          borderRadius: 20,
          borderCurve: 'continuous',
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          boxShadow: shadows.ai,
        },
        gradientBg(gradients.ai),
      ]}
    >
      <Pulse>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            borderCurve: 'continuous',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sf={sf} md={md} size={22} color="#FFFFFF" />
        </View>
      </Pulse>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>{title}</Text>
        <Text style={{ fontSize: 13, lineHeight: 17, color: 'rgba(255, 255, 255, 0.85)' }}>
          {subtitle}
        </Text>
      </View>
      <Icon sf="chevron.right" md="chevron-right" size={16} color="rgba(255, 255, 255, 0.8)" />
    </PressableScale>
  );
}
