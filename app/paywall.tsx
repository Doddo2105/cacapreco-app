import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { GradientButton } from '@/components/gradient-button';
import { Icon } from '@/components/icon';
import { enterUp, Pulse } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { useToast } from '@/components/toast';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import { haptics } from '@/utils/format';

const VIP_BENEFITS = [
  {
    sf: 'bolt.fill',
    md: 'bolt',
    title: 'Fura-fila nos Bugs de Preço',
    text: 'Veja queimas de estoque antes de esgotarem',
  },
  {
    sf: 'bell.badge.fill',
    md: 'notifications-active',
    title: 'Alertas ilimitados',
    text: 'Monitore quantos produtos quiser, online e no mercado',
  },
  {
    sf: 'cart.fill',
    md: 'shopping-cart',
    title: 'Comparador completo de cesta',
    text: 'Todos os atacarejos da sua região lado a lado',
  },
  {
    sf: 'tag.fill',
    md: 'local-offer',
    title: 'Cupons exclusivos',
    text: 'Desbloqueados com um toque',
  },
];

type Plan = 'anual' | 'mensal';

export default function PaywallScreen() {
  useColorScheme();
  const router = useRouter();
  const toast = useToast();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { updateSettings } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('anual');

  const handleSubscribe = () => {
    haptics.success();
    updateSettings({ isVip: true, vipPlan: selectedPlan });
    router.back();
    toast.show({
      tone: 'gold',
      title: 'Bem-vindo ao CaçaPreço VIP!',
      message: 'Bugs de Preço e alertas ilimitados liberados.',
      sf: 'bolt.fill',
      md: 'bolt',
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: 'CaçaPreço VIP' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
      >
        {/* Hero */}
        <Animated.View entering={enterUp(0)}>
          <View
            style={[
              {
                borderRadius: 26,
                borderCurve: 'continuous',
                padding: 20,
                gap: 12,
              },
              gradientBg(gradients.vipHero),
            ]}
          >
            <Pulse style={{ alignSelf: 'flex-start' }}>
              <View
                style={[
                  {
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: shadows.gold,
                  },
                  gradientBg(gradients.gold),
                ]}
              >
                <Icon sf="bolt.fill" md="bolt" size={28} color={colors.onBrand} />
              </View>
            </Pulse>
            <Text style={{ fontSize: 12, fontWeight: '800', color: palette.gold }}>
              RADAR FURA-FILA VIP
            </Text>
            <Text
              style={{ fontSize: 26, fontWeight: '900', lineHeight: 31, color: '#FFFFFF' }}
            >
              Economize até{' '}
              <Text style={{ color: palette.lime }}>R$ 350 por mês</Text> no mercado e pegue
              eletrônicos a preço de custo
            </Text>
          </View>
        </Animated.View>

        {reason ? (
          <Animated.View entering={enterUp(1)}>
            <View
              style={{
                backgroundColor: 'rgba(251, 191, 36, 0.16)',
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Icon sf="lock.fill" md="lock" size={18} color={palette.goldDeep} />
              <Text selectable style={{ flex: 1, fontSize: 14, lineHeight: 19, color: colors.label }}>
                {reason}
              </Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Benefits */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 16,
            gap: 14,
          }}
        >
          {VIP_BENEFITS.map((b, i) => (
            <Animated.View
              key={b.title}
              entering={enterUp(i + 1)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  backgroundColor: 'rgba(16, 185, 129, 0.14)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon sf={b.sf} md={b.md} size={19} color={colors.tint} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                  {b.title}
                </Text>
                <Text style={{ fontSize: 13, lineHeight: 18, color: colors.secondaryLabel }}>
                  {b.text}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Plans */}
        <PlanCard
          selected={selectedPlan === 'anual'}
          onPress={() => setSelectedPlan('anual')}
          badge="MAIS ESCOLHIDO · ECONOMIZE 41%"
          title="Passaporte Anual VIP"
          subtitle="7 dias grátis, depois R$ 69,90/ano"
          price="R$ 5,82"
        />
        <PlanCard
          selected={selectedPlan === 'mensal'}
          onPress={() => setSelectedPlan('mensal')}
          title="Plano Mensal VIP"
          subtitle="Cancele quando quiser"
          price="R$ 9,90"
        />

        <GradientButton
          size="lg"
          tone="gold"
          sf="bolt.fill"
          md="bolt"
          label={
            selectedPlan === 'anual' ? 'Começar 7 dias grátis' : 'Assinar por R$ 9,90/mês'
          }
          sublabel="Uma única compra no mercado já paga a assinatura"
          onPress={handleSubscribe}
        />
      </ScrollView>
    </>
  );
}

function PlanCard({
  selected,
  onPress,
  badge,
  title,
  subtitle,
  price,
}: {
  selected: boolean;
  onPress: () => void;
  badge?: string;
  title: string;
  subtitle: string;
  price: string;
}) {
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}, ${price} por mês`}
      scaleTo={0.985}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        borderCurve: 'continuous',
        padding: 16,
        borderWidth: 2,
        borderColor: selected ? palette.goldDeep : colors.separator,
        gap: 8,
        boxShadow: selected ? shadows.gold : undefined,
      }}
    >
      {badge ? (
        <View
          style={[
            {
              alignSelf: 'flex-start',
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 8,
            },
            gradientBg(gradients.money),
          ]}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>{badge}</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            borderWidth: selected ? 0 : 2,
            borderColor: colors.tertiaryLabel,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {selected ? (
            <Animated.View
              entering={ZoomIn.duration(180)}
              style={[
                {
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                gradientBg(gradients.gold),
              ]}
            >
              <Icon sf="checkmark" md="check" size={14} color={colors.onBrand} weight="bold" />
            </Animated.View>
          ) : null}
        </View>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>{title}</Text>
          <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>{subtitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontSize: 21,
              fontWeight: '800',
              color: colors.label,
              fontVariant: ['tabular-nums'],
            }}
          >
            {price}
          </Text>
          <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>/mês</Text>
        </View>
      </View>
    </PressableScale>
  );
}
