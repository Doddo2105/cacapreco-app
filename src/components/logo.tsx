import { Image, Text, View } from 'react-native';
import { APP_NAME } from '@/constants/brand';
import { colors, shadows } from '@/theme/colors';

const MARK = require('../../assets/logo-mark.png');

/** App icon mark: price tag "sniffing out" a falling price. */
export function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.23,
        borderCurve: 'continuous',
        boxShadow: shadows.money,
      }}
    >
      <Image
        source={MARK}
        accessibilityLabel={`Logo ${APP_NAME}`}
        style={{ width: size, height: size, borderRadius: size * 0.23 }}
      />
    </View>
  );
}

/** Mark + wordmark, side by side. */
export function LogoLockup({ size = 40, color }: { size?: number; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.28 }}>
      <LogoMark size={size} />
      <Text
        style={{
          fontSize: size * 0.72,
          fontWeight: '900',
          letterSpacing: -size * 0.02,
          color: color ?? colors.label,
        }}
      >
        {APP_NAME}
      </Text>
    </View>
  );
}
