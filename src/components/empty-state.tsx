import type { ReactNode } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { colors, gradientBg, gradients } from '@/theme/colors';

interface EmptyStateProps {
  sf: string;
  md: string;
  title: string;
  message: string;
  children?: ReactNode;
}

/** Friendly empty state: says what's missing and what to do next. */
export function EmptyState({ sf, md, title, message, children }: EmptyStateProps) {
  useColorScheme();
  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 22,
          borderCurve: 'continuous',
          padding: 28,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 20,
              borderCurve: 'continuous',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            },
            gradientBg(gradients.money),
          ]}
        >
          <Icon sf={sf} md={md} size={28} color="#FFFFFF" />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.label, textAlign: 'center' }}>
          {title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: colors.secondaryLabel,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
        {children}
      </View>
    </Animated.View>
  );
}
