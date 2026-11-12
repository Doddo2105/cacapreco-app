import { useEffect, useRef, useState } from 'react';
import { Text, useColorScheme, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { colors } from '@/theme/colors';
import { copyToClipboard, haptics } from '@/utils/format';

interface CouponTicketProps {
  code: string;
  locked: boolean;
  onLockedPress: () => void;
  size?: 'sm' | 'lg';
}

/** Dashed "cut-out" coupon. One tap really copies the code and confirms in place. */
export function CouponTicket({ code, locked, onLockedPress, size = 'sm' }: CouponTicketProps) {
  useColorScheme();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lg = size === 'lg';

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const handlePress = async () => {
    if (locked) {
      haptics.tap();
      onLockedPress();
      return;
    }
    const ok = await copyToClipboard(code);
    if (!ok) return;
    haptics.success();
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={
        locked ? 'Cupom exclusivo VIP' : copied ? 'Cupom copiado' : `Copiar cupom ${code}`
      }
      onPress={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handlePress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: lg ? 'space-between' : 'center',
        gap: 8,
        minHeight: lg ? 60 : 44,
        paddingHorizontal: lg ? 16 : 12,
        paddingVertical: lg ? 12 : 9,
        borderRadius: lg ? 16 : 13,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.tint,
        backgroundColor: 'rgba(16, 185, 129, 0.10)',
      }}
    >
      <View style={{ gap: 2, flexShrink: 1 }}>
        {lg ? (
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.secondaryLabel }}>
            CUPOM DE DESCONTO
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={{
            fontSize: lg ? 19 : 13,
            fontWeight: '800',
            letterSpacing: 0.5,
            color: colors.tint,
          }}
        >
          {locked ? 'Cupom VIP' : code}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        {copied ? (
          <Animated.View key="ok" entering={ZoomIn.duration(180)}>
            <Icon sf="checkmark.circle.fill" md="check-circle" size={lg ? 20 : 16} color={colors.tint} />
          </Animated.View>
        ) : (
          <Icon
            sf={locked ? 'lock.fill' : 'doc.on.doc'}
            md={locked ? 'lock' : 'content-copy'}
            size={lg ? 18 : 14}
            color={colors.tint}
          />
        )}
        {lg ? (
          <Text style={{ fontSize: 13, fontWeight: '700', color: colors.tint }}>
            {locked ? 'Liberar' : copied ? 'Copiado!' : 'Copiar'}
          </Text>
        ) : null}
      </View>
    </PressableScale>
  );
}
