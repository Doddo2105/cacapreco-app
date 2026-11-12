import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Icon } from '@/components/icon';
import { FREE_ALERTS_LIMIT } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import type { PriceAlert } from '@/types';
import { formatCurrency, haptics, parseNumber } from '@/utils/format';

export default function AlertsScreen() {
  useColorScheme();
  const router = useRouter();
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
      Alert.alert(
        'Preencha os campos',
        'Informe o nome do produto (ex: Picanha, AirFryer) e o preço máximo desejado.'
      );
      return;
    }

    haptics.success();
    addAlert(keyword, parseNumber(targetPrice) || 50, scope);
    setKeyword('');
    setTargetPrice('');
  };

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 12,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.label,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
        gap: 16,
      }}
    >
      {/* Create Price Alert Box */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          gap: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
            Novo Alerta de Preço Desejado
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.secondaryLabel,
              fontVariant: ['tabular-nums'],
            }}
          >
            {settings.isVip ? 'VIP Ilimitado' : `${alerts.length}/${FREE_ALERTS_LIMIT} grátis`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder="Produto (ex: Whey, Picanha)"
            placeholderTextColor={colors.secondaryLabel as string}
            value={keyword}
            onChangeText={setKeyword}
            style={[inputStyle, { flex: 1 }]}
          />
          <TextInput
            placeholder="Até R$"
            placeholderTextColor={colors.secondaryLabel as string}
            keyboardType="numeric"
            value={targetPrice}
            onChangeText={setTargetPrice}
            style={[inputStyle, { width: 110 }]}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['ambos', 'online', 'mercado'] as const).map((sc) => {
            const active = scope === sc;
            return (
              <Pressable
                key={sc}
                onPress={() => setScope(sc)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  backgroundColor: active ? colors.tint : colors.fill,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: active ? colors.onTint : colors.secondaryLabel,
                  }}
                >
                  {sc === 'ambos' ? 'Ambos' : sc === 'online' ? 'Só Online' : 'Só Mercado'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleCreateAlert}
          style={{
            backgroundColor: colors.tint,
            borderRadius: 12,
            borderCurve: 'continuous',
            paddingVertical: 13,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Icon sf="bell.badge.fill" md="add-alert" size={17} color={colors.onTint} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onTint }}>
            Ativar Alerta de Preço
          </Text>
        </Pressable>
      </View>

      {/* Active Alerts & Triggered Deals */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
          Meus Alertas ({matchedAlerts.length})
        </Text>

        {matchedAlerts.map(({ alert, deals }) => (
          <View
            key={alert.id}
            style={{
              padding: 12,
              borderRadius: 12,
              borderCurve: 'continuous',
              backgroundColor: colors.fill,
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                  {alert.keyword}{' '}
                  <Text
                    style={{
                      fontWeight: '800',
                      color: colors.tint,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    ≤ {formatCurrency(alert.targetPrice)}
                  </Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                  Monitorando: {alert.scope.toUpperCase()}
                </Text>
              </View>

              <Pressable onPress={() => removeAlert(alert.id)} style={{ padding: 6 }}>
                <Icon sf="trash" md="delete" size={18} color={colors.danger} />
              </Pressable>
            </View>

            {deals.length > 0 ? (
              deals.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => router.push(`/deal/${d.id}` as any)}
                  style={{
                    backgroundColor: colors.card,
                    padding: 10,
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: colors.success }}>
                      META ATINGIDA NA {d.storeName.toUpperCase()}!
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 13, fontWeight: '600', color: colors.label }}
                    >
                      {d.title}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: colors.success,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatCurrency(d.dealPrice)}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                Aguardando oferta abaixo de {formatCurrency(alert.targetPrice)}...
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Affiliate Monetization & VIP Settings */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
              Assinatura CaçaPreço VIP
            </Text>
            <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
              Libera Bugs de Preço e Alertas Ilimitados
            </Text>
          </View>
          <Switch
            value={settings.isVip}
            onValueChange={(isVip) =>
              updateSettings({ isVip, vipPlan: isVip ? 'anual' : null })
            }
          />
        </View>

        <View
          style={{
            paddingTop: 12,
            borderTopWidth: 0.5,
            borderTopColor: colors.separator,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.label }}>
            Seus Códigos de Afiliado (Monetização Automática)
          </Text>
          <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
            Todo clique em &ldquo;Pegar Promoção&rdquo; adiciona sua tag de afiliado
            automaticamente.
          </Text>

          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
              Cidade dos Supermercados
            </Text>
            <TextInput
              value={settings.city}
              onChangeText={(city) => updateSettings({ city })}
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
              Tag Associados Amazon (ex: seuapp-20)
            </Text>
            <TextInput
              value={settings.amazonTag}
              onChangeText={(amazonTag) => updateSettings({ amazonTag })}
              autoCapitalize="none"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
              ID Afiliado Mercado Livre
            </Text>
            <TextInput
              value={settings.mercadoLivreTag}
              onChangeText={(mercadoLivreTag) => updateSettings({ mercadoLivreTag })}
              autoCapitalize="none"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
              ID Afiliado Shopee
            </Text>
            <TextInput
              value={settings.shopeeTag}
              onChangeText={(shopeeTag) => updateSettings({ shopeeTag })}
              autoCapitalize="none"
              style={inputStyle}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
