import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { GradientButton } from '@/components/gradient-button';
import { Icon } from '@/components/icon';
import { Appear, enterUp, Pulse, reflow } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { useToast } from '@/components/toast';
import { FREE_ALERTS_LIMIT } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import type { PriceAlert } from '@/types';
import { formatCurrency, haptics, parseNumber } from '@/utils/format';

const SCOPE_LABEL: Record<PriceAlert['scope'], string> = {
  ambos: 'Online e mercados',
  online: 'Só online',
  mercado: 'Só mercados',
};

export default function AlertsScreen() {
  useColorScheme();
  const router = useRouter();
  const toast = useToast();
  const {
    settings,
    alerts,
    matchedAlerts,
    canAddAlert,
    addAlert,
    removeAlert,
    updateSettings,
  } = useApp();

  const [keyword, setKeyword] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [scope, setScope] = useState<PriceAlert['scope']>('ambos');
  const [formError, setFormError] = useState('');

  const triggeredCount = matchedAlerts.filter((m) => m.deals.length > 0).length;

  const handleCreateAlert = () => {
    if (!canAddAlert) {
      router.push({
        pathname: '/paywall',
        params: {
          reason: `O plano gratuito permite até ${FREE_ALERTS_LIMIT} alertas simultâneos. Assine o VIP para monitorar produtos ilimitados!`,
        },
      } as any);
      return;
    }

    if (!keyword.trim() || !targetPrice.trim()) {
      haptics.warning();
      setFormError('Informe o produto e o preço máximo que você quer pagar.');
      return;
    }

    setFormError('');
    haptics.success();
    addAlert(keyword, parseNumber(targetPrice) || 50, scope);
    toast.show({
      title: 'Alerta ativado',
      message: `Monitorando "${keyword.trim()}" para você.`,
      sf: 'bell.badge.fill',
      md: 'notifications-active',
    });
    setKeyword('');
    setTargetPrice('');
  };

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 13,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
    color: colors.label,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Create alert */}
      <Animated.View entering={enterUp(0)}>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
            boxShadow: shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={[
                {
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                gradientBg(gradients.money),
              ]}
            >
              <Icon sf="bell.badge.fill" md="add-alert" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                Avise-me quando baixar
              </Text>
              <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                Diga o produto e quanto quer pagar
              </Text>
            </View>
          </View>

          {/* Free plan slots */}
          {settings.isVip ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon sf="checkmark.seal.fill" md="verified" size={15} color={palette.goldDeep} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.secondaryLabel }}>
                VIP · alertas ilimitados
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {Array.from({ length: FREE_ALERTS_LIMIT }, (_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 22,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor:
                        i < alerts.length ? palette.emerald : 'rgba(120, 120, 128, 0.24)',
                    }}
                  />
                ))}
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: colors.secondaryLabel,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {Math.min(alerts.length, FREE_ALERTS_LIMIT)} de {FREE_ALERTS_LIMIT} alertas grátis
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              accessibilityLabel="Produto"
              placeholder="Produto (ex: whey, picanha)"
              placeholderTextColor={colors.secondaryLabel as string}
              value={keyword}
              onChangeText={(t) => {
                setKeyword(t);
                if (formError) setFormError('');
              }}
              style={[inputStyle, { flex: 1, minWidth: 0 }]}
            />
            <TextInput
              accessibilityLabel="Preço máximo em reais"
              placeholder="Até R$"
              placeholderTextColor={colors.secondaryLabel as string}
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={(t) => {
                setTargetPrice(t);
                if (formError) setFormError('');
              }}
              style={[inputStyle, { width: 104, fontVariant: ['tabular-nums'] }]}
            />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['ambos', 'online', 'mercado'] as const).map((sc) => (
              <View
                key={sc}
                style={{ borderRadius: 999, backgroundColor: colors.fill }}
              >
                <FilterChip
                  label={SCOPE_LABEL[sc]}
                  active={scope === sc}
                  onPress={() => setScope(sc)}
                />
              </View>
            ))}
          </View>

          {formError ? (
            <Text selectable style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>
              {formError}
            </Text>
          ) : null}

          <GradientButton
            size="lg"
            tone={canAddAlert ? 'money' : 'gold'}
            label={canAddAlert ? 'Ativar alerta de preço' : 'Liberar alertas ilimitados'}
            sf={canAddAlert ? 'bell.badge.fill' : 'bolt.fill'}
            md={canAddAlert ? 'add-alert' : 'bolt'}
            onPress={handleCreateAlert}
          />
        </View>
      </Animated.View>

      {/* Alerts */}
      <Animated.View layout={reflow} style={{ gap: 10 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.secondaryLabel,
            fontVariant: ['tabular-nums'],
          }}
        >
          {matchedAlerts.length} {matchedAlerts.length === 1 ? 'ALERTA' : 'ALERTAS'}
          {triggeredCount > 0 ? ` · ${triggeredCount} NA META` : ''}
        </Text>

        {matchedAlerts.length === 0 ? (
          <EmptyState
            sf="bell"
            md="notifications-none"
            title="Nenhum alerta ainda"
            message="Crie um alerta acima e avisamos assim que o preço chegar onde você quer."
          />
        ) : null}

        {matchedAlerts.map(({ alert, deals }, index) => {
          const hit = deals.length > 0;
          return (
            <Appear key={alert.id} index={index + 1}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 18,
                  borderCurve: 'continuous',
                  padding: 14,
                  gap: 10,
                  borderWidth: hit ? 1.5 : 0,
                  borderColor: palette.emerald,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Pulse active={hit}>
                    <View
                      style={[
                        {
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          borderCurve: 'continuous',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(120, 120, 128, 0.16)',
                        },
                        hit ? gradientBg(gradients.money) : null,
                      ]}
                    >
                      <Icon
                        sf={hit ? 'bell.badge.fill' : 'bell'}
                        md={hit ? 'notifications-active' : 'notifications-none'}
                        size={19}
                        color={hit ? '#FFFFFF' : colors.secondaryLabel}
                      />
                    </View>
                  </Pulse>

                  <View style={{ flex: 1, gap: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 16, fontWeight: '800', color: colors.label }}
                    >
                      {alert.keyword}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.secondaryLabel,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      Até{' '}
                      <Text style={{ fontWeight: '800', color: colors.tint }}>
                        {formatCurrency(alert.targetPrice)}
                      </Text>{' '}
                      · {SCOPE_LABEL[alert.scope]}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remover alerta ${alert.keyword}`}
                    hitSlop={10}
                    onPress={() => {
                      haptics.tap();
                      removeAlert(alert.id);
                    }}
                    style={{ padding: 6 }}
                  >
                    <Icon sf="trash" md="delete-outline" size={19} color={colors.danger} />
                  </Pressable>
                </View>

                {hit ? (
                  deals.map((d) => (
                    <PressableScale
                      key={d.id}
                      accessibilityRole="button"
                      onPress={() => router.push(`/deal/${d.id}` as any)}
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.10)',
                        padding: 11,
                        borderRadius: 13,
                        borderCurve: 'continuous',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <View style={{ flex: 1, gap: 1 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.success }}>
                          META ATINGIDA · {d.storeName.toUpperCase()}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 14, fontWeight: '600', color: colors.label }}
                        >
                          {d.title}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '800',
                          color: colors.success,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {formatCurrency(d.dealPrice)}
                      </Text>
                      <Icon
                        sf="chevron.right"
                        md="chevron-right"
                        size={12}
                        color={colors.tertiaryLabel}
                      />
                    </PressableScale>
                  ))
                ) : (
                  <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                    De olho — avisamos quando aparecer abaixo de{' '}
                    {formatCurrency(alert.targetPrice)}.
                  </Text>
                )}
              </View>
            </Appear>
          );
        })}
      </Animated.View>

      {/* VIP upsell */}
      {!settings.isVip ? (
        <Animated.View layout={reflow} entering={enterUp(3)}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Conhecer o plano VIP"
            onPress={() => {
              haptics.tap();
              router.push('/paywall' as any);
            }}
            style={[
              {
                borderRadius: 22,
                borderCurve: 'continuous',
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              },
              gradientBg(gradients.vipHero),
            ]}
          >
            <View
              style={[
                {
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                gradientBg(gradients.gold),
              ]}
            >
              <Icon sf="bolt.fill" md="bolt" size={23} color={colors.onBrand} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>
                Alertas ilimitados no VIP
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 17, color: 'rgba(255, 255, 255, 0.8)' }}>
                E acesso antecipado aos Bugs de Preço
              </Text>
            </View>
            <Icon sf="chevron.right" md="chevron-right" size={16} color={palette.gold} />
          </PressableScale>
        </Animated.View>
      ) : null}

    </ScrollView>
  );
}
