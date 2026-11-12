import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { Icon } from '@/components/icon';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import { haptics } from '@/utils/format';

const VIP_BENEFITS = [
  {
    sf: 'bolt.fill',
    md: 'bolt',
    text: 'Acesso Fura-Fila aos "Bugs de Preço" e queimas de estoque antes de esgotar',
  },
  {
    sf: 'bell.badge.fill',
    md: 'notifications-active',
    text: 'Alertas de Preço ILIMITADOS para monitorar produtos online e mercados',
  },
  {
    sf: 'cart.fill',
    md: 'shopping-cart',
    text: 'Comparador completo de cesta básica entre todos os atacarejos da região',
  },
  {
    sf: 'tag.fill',
    md: 'local-offer',
    text: 'Cupons exclusivos desbloqueados com 1 toque',
  },
];

export default function PaywallScreen() {
  useColorScheme();
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const { updateSettings } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'anual' | 'mensal'>('anual');

  const handleSubscribe = () => {
    haptics.success();
    updateSettings({ isVip: true, vipPlan: selectedPlan });
    Alert.alert(
      'Bem-vindo ao CaçaPreço VIP!',
      'Todos os Bugs de Preço e Alertas Ilimitados foram desbloqueados.'
    );
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'CaçaPreço VIP' }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <View style={{ gap: 6 }}>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.brand,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onBrand }}>
              RADAR FURA-FILA VIP
            </Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.label, lineHeight: 30 }}>
            Pague preço de custo em eletrônicos e economize até R$ 350/mês no mercado
          </Text>
        </View>

        {reason ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              borderCurve: 'continuous',
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon sf="lock.fill" md="lock" size={18} color={colors.warning} />
            <Text selectable style={{ flex: 1, fontSize: 13, color: colors.label }}>
              {reason}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
          }}
        >
          {VIP_BENEFITS.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon sf={b.sf} md={b.md} size={18} color={colors.tint} />
              <Text style={{ flex: 1, fontSize: 14, color: colors.label }}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Annual Plan */}
        <Pressable
          onPress={() => {
            haptics.tap();
            setSelectedPlan('anual');
          }}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            borderWidth: 2,
            borderColor: selectedPlan === 'anual' ? colors.brand : colors.separator,
            gap: 6,
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.success,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>
              MAIS ESCOLHIDO · ECONOMIZE 41%
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
                Passaporte Anual VIP
              </Text>
              <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                7 dias grátis, depois R$ 69,90/ano
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.label,
                  fontVariant: ['tabular-nums'],
                }}
              >
                R$ 5,82
              </Text>
              <Text style={{ fontSize: 11, color: colors.secondaryLabel }}>/mês</Text>
            </View>
          </View>
        </Pressable>

        {/* Monthly Plan */}
        <Pressable
          onPress={() => {
            haptics.tap();
            setSelectedPlan('mensal');
          }}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            borderWidth: 2,
            borderColor: selectedPlan === 'mensal' ? colors.brand : colors.separator,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
                Plano Mensal VIP
              </Text>
              <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                Cancele quando quiser na Play Store
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: colors.label,
                  fontVariant: ['tabular-nums'],
                }}
              >
                R$ 9,90
              </Text>
              <Text style={{ fontSize: 11, color: colors.secondaryLabel }}>/mês</Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={handleSubscribe}
          style={{
            backgroundColor: colors.brand,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingVertical: 15,
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.onBrand }}>
            Ativar CaçaPreço VIP ({selectedPlan === 'anual' ? 'R$ 5,82/mês' : 'R$ 9,90/mês'})
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.onBrand, opacity: 0.85 }}>
            1 única compra no mercado já paga a assinatura inteira
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}
