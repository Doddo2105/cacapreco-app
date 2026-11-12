import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Icon } from '@/components/icon';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import {
  buildAffiliateLink,
  calcDiscountPercent,
  formatCurrency,
  formatRelativeTime,
  haptics,
} from '@/utils/format';

export default function DealDetailScreen() {
  useColorScheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, deals, getDeal, voteDeal, addShoppingItem, addAlert } = useApp();
  const [copied, setCopied] = useState(false);

  const deal = id ? getDeal(id) : undefined;

  if (!deal) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 16, color: colors.secondaryLabel }}>
          Promoção não encontrada.
        </Text>
      </View>
    );
  }

  const store = getStoreMeta(deal.storeName);
  const discountPct = calcDiscountPercent(deal.originalPrice, deal.dealPrice);
  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);
  const isLockedVip = deal.isVipEarly && !settings.isVip;

  // Find competing offers for the same product across other stores
  const firstWord = deal.title.split(' ')[0]?.toLowerCase() ?? '';
  const competingDeals = deals.filter(
    (d) =>
      d.id !== deal.id &&
      firstWord.length > 3 &&
      d.title.toLowerCase().includes(firstWord)
  );

  const handlePrimaryAction = async () => {
    haptics.tap();
    if (isLockedVip) {
      router.push({
        pathname: '/paywall',
        params: {
          reason:
            'Desbloqueie links e cupons de Bugs de Preço em tempo real com o CaçaPreço VIP.',
        },
      } as any);
      return;
    }

    if (deal.kind === 'mercado' && !deal.affiliateUrl) {
      addShoppingItem(deal.title, 1, deal.unit);
      haptics.success();
      Alert.alert(
        'Adicionado à Minha Cesta!',
        `"${deal.title}" foi incluído na sua lista inteligente de compras.`
      );
      return;
    }

    const url = buildAffiliateLink(deal.affiliateUrl, deal.storeName, settings);
    await Linking.openURL(url);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: deal.storeName,
          headerRight: () => (
            <Pressable
              onPress={() =>
                Share.share({
                  message: `${deal.title} por ${formatCurrency(deal.dealPrice)} na ${
                    deal.storeName
                  }${deal.couponCode ? ` (Cupom: ${deal.couponCode})` : ''}`,
                })
              }
              style={{ paddingHorizontal: 8 }}
            >
              <Icon sf="square.and.arrow.up" md="share" size={20} color={colors.tint} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        {/* Main Deal Card */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 18,
            borderCurve: 'continuous',
            padding: 18,
            gap: 14,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: store.color,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <Icon sf={store.sf} md={store.md} size={14} color="#FFFFFF" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                {deal.storeName}
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
              {deal.category} · {formatRelativeTime(deal.createdAt)}
            </Text>
          </View>

          <Text
            selectable
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: colors.label,
              lineHeight: 26,
            }}
          >
            {deal.title}
          </Text>

          {deal.description ? (
            <Text selectable style={{ fontSize: 14, color: colors.secondaryLabel, lineHeight: 20 }}>
              {deal.description}
            </Text>
          ) : null}

          {/* Price Block */}
          <View
            style={{
              backgroundColor: colors.fill,
              borderRadius: 14,
              borderCurve: 'continuous',
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.secondaryLabel,
                  textDecorationLine: 'line-through',
                  fontVariant: ['tabular-nums'],
                }}
              >
                Preço normal: {formatCurrency(deal.originalPrice)}
              </Text>
              <Text
                selectable
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: colors.success,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatCurrency(deal.dealPrice)}
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.secondaryLabel }}>
                  {' '}
                  /{deal.unit}
                </Text>
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: colors.success,
                  fontVariant: ['tabular-nums'],
                }}
              >
                Economia de {formatCurrency(savings)} (-{discountPct}%)
              </Text>
            </View>

            {/* Temperature Voter */}
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  voteDeal(deal.id, 10);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Icon sf="flame.fill" md="local-fire-department" size={16} color="#EA580C" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    color: '#EA580C',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {deal.temperature}°
                </Text>
              </Pressable>
              <Text style={{ fontSize: 11, color: colors.secondaryLabel }}>Toque p/ esquentar</Text>
            </View>
          </View>

          {/* Coupon Box */}
          {deal.couponCode ? (
            <Pressable
              onPress={() => {
                if (isLockedVip) {
                  router.push('/paywall' as any);
                  return;
                }
                haptics.success();
                setCopied(true);
              }}
              style={{
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.tint,
                borderRadius: 14,
                borderCurve: 'continuous',
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.secondaryLabel }}>
                  CUPOM DE DESCONTO
                </Text>
                <Text
                  selectable={!isLockedVip}
                  style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: colors.tint,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {isLockedVip ? 'EXCLUSIVO VIP 🔒' : deal.couponCode}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.tint }}>
                {copied ? 'Copiado!' : 'Toque para selecionar'}
              </Text>
            </Pressable>
          ) : null}

          {/* Primary CTA */}
          <Pressable
            onPress={handlePrimaryAction}
            style={{
              backgroundColor: isLockedVip
                ? colors.brand
                : deal.kind === 'online'
                ? colors.tint
                : colors.success,
              borderRadius: 14,
              borderCurve: 'continuous',
              paddingVertical: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon
              sf={
                isLockedVip
                  ? 'lock.fill'
                  : deal.kind === 'online'
                  ? 'arrow.up.right.square.fill'
                  : 'cart.badge.plus'
              }
              md={
                isLockedVip
                  ? 'lock'
                  : deal.kind === 'online'
                  ? 'open-in-new'
                  : 'add-shopping-cart'
              }
              size={18}
              color={isLockedVip ? colors.onBrand : '#FFFFFF'}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: isLockedVip ? colors.onBrand : '#FFFFFF',
              }}
            >
              {isLockedVip
                ? 'Liberar Bug de Preço no VIP'
                : deal.kind === 'online'
                ? `Ir para ${deal.storeName}`
                : 'Adicionar à Minha Cesta de Mercado'}
            </Text>
          </Pressable>

          {/* Secondary Actions */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={() => {
                haptics.tap();
                addShoppingItem(deal.title, 1, deal.unit);
                Alert.alert('Na Cesta!', 'Item adicionado à sua Lista de Compras.');
              }}
              style={{
                flex: 1,
                backgroundColor: colors.fill,
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon sf="checklist" md="playlist-add" size={16} color={colors.label} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.label }}>
                + Lista de Compras
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.tap();
                const shortName = deal.title.split(' ').slice(0, 2).join(' ');
                addAlert(shortName, deal.dealPrice, deal.kind);
                Alert.alert('Alerta Criado!', `Monitorando "${shortName}" para você.`);
              }}
              style={{
                flex: 1,
                backgroundColor: colors.fill,
                borderRadius: 12,
                borderCurve: 'continuous',
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon sf="bell.badge" md="notifications" size={16} color={colors.label} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.label }}>
                Monitorar Preço
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Competing Offers */}
        {competingDeals.length > 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 16,
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
              Comparativo em outras lojas / mercados
            </Text>
            {competingDeals.map((other) => (
              <Pressable
                key={other.id}
                onPress={() => router.replace(`/deal/${other.id}` as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 0.5,
                  borderBottomColor: colors.separator,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.label }}>
                    {other.storeName}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 12, color: colors.secondaryLabel }}>
                    {other.title}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: other.dealPrice < deal.dealPrice ? colors.success : colors.label,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(other.dealPrice)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
