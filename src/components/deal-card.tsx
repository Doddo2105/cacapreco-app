import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  Share,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Icon } from '@/components/icon';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import type { Deal } from '@/types';
import {
  buildAffiliateLink,
  calcDiscountPercent,
  formatCurrency,
  formatRelativeTime,
  haptics,
} from '@/utils/format';

export function DealCard({ deal }: { deal: Deal }) {
  useColorScheme();
  const router = useRouter();
  const { settings, voteDeal, addShoppingItem, addAlert } = useApp();
  const [copied, setCopied] = useState(false);

  const store = getStoreMeta(deal.storeName);
  const discountPct = calcDiscountPercent(deal.originalPrice, deal.dealPrice);
  const isLockedVip = deal.isVipEarly && !settings.isVip;

  const handleOpenAffiliate = async () => {
    haptics.tap();
    if (isLockedVip) {
      router.push({
        pathname: '/paywall',
        params: {
          reason:
            'Esta é uma oferta "Bug de Preço" com acesso antecipado exclusivo para assinantes VIP.',
        },
      } as any);
      return;
    }

    if (deal.kind === 'mercado' && !deal.affiliateUrl) {
      addShoppingItem(deal.title, 1, deal.unit);
      haptics.success();
      Alert.alert(
        'Adicionado à Lista!',
        `"${deal.title}" (${deal.storeName}) foi incluído na sua Lista & Economia.`
      );
      return;
    }

    const url = buildAffiliateLink(deal.affiliateUrl, deal.storeName, settings);
    await Linking.openURL(url);
  };

  const handleCopyCoupon = () => {
    if (!deal.couponCode) return;
    if (isLockedVip) {
      router.push({
        pathname: '/paywall',
        params: {
          reason: 'Libere o cupom exclusivo de Bug de Preço com o CaçaPreço VIP.',
        },
      } as any);
      return;
    }
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${deal.title} por ${formatCurrency(deal.dealPrice)} na ${deal.storeName}${
        deal.couponCode ? ` (Cupom: ${deal.couponCode})` : ''
      }`,
    });
  };

  return (
    <Link href={`/deal/${deal.id}` as any} asChild>
      <Link.Trigger>
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Top Row: Store Pill + Temperature + Discount Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: store.color,
                }}
              >
                <Icon sf={store.sf} md={store.md} size={13} color="#FFFFFF" />
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>
                  {deal.storeName}
                </Text>
              </View>

              <Text style={{ fontSize: 12, color: colors.secondaryLabel }} numberOfLines={1}>
                {deal.category} · {formatRelativeTime(deal.createdAt)}
              </Text>
            </View>

            {/* Temperature Vote Button */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                haptics.tap();
                voteDeal(deal.id, 5);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: colors.fill,
              }}
            >
              <Icon sf="flame.fill" md="local-fire-department" size={14} color="#EA580C" />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '800',
                  color: '#EA580C',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {deal.temperature}°
              </Text>
            </Pressable>
          </View>

          {/* VIP Early Access Banner if applicable */}
          {deal.isVipEarly ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.brand,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
                borderCurve: 'continuous',
                alignSelf: 'flex-start',
              }}
            >
              <Icon sf="bolt.fill" md="bolt" size={13} color={colors.onBrand} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onBrand }}>
                BUG DE PREÇO / ACESSO ANTECIPADO VIP
              </Text>
            </View>
          ) : null}

          {/* Title & Description */}
          <View style={{ gap: 4 }}>
            <Text
              selectable
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.label,
                lineHeight: 22,
              }}
            >
              {deal.title}
            </Text>
            {deal.description ? (
              <Text
                numberOfLines={2}
                style={{ fontSize: 13, color: colors.secondaryLabel, lineHeight: 18 }}
              >
                {deal.description}
              </Text>
            ) : null}
          </View>

          {/* Price & Discount Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingTop: 10,
              borderTopWidth: 0.5,
              borderTopColor: colors.separator,
            }}
          >
            <View style={{ gap: 2 }}>
              {deal.originalPrice > deal.dealPrice ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.secondaryLabel,
                    textDecorationLine: 'line-through',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  De {formatCurrency(deal.originalPrice)}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text
                  selectable
                  style={{
                    fontSize: 22,
                    fontWeight: '800',
                    color: colors.success,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(deal.dealPrice)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>/{deal.unit}</Text>
              </View>
            </View>

            {discountPct > 0 ? (
              <View
                style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 8,
                  borderCurve: 'continuous',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '800',
                    color: '#FFFFFF',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  -{discountPct}% OFF
                </Text>
              </View>
            ) : null}
          </View>

          {/* Coupon + Action Row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {deal.couponCode ? (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleCopyCoupon();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: colors.tint,
                  backgroundColor: colors.fill,
                }}
              >
                <Icon sf="scissors" md="content-cut" size={14} color={colors.tint} />
                <Text
                  selectable={!isLockedVip}
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: colors.tint,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {isLockedVip ? 'CUPOM VIP 🔒' : copied ? 'COPIADO!' : deal.couponCode}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleOpenAffiliate();
              }}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 11,
                paddingHorizontal: 12,
                borderRadius: 10,
                borderCurve: 'continuous',
                backgroundColor: isLockedVip
                  ? colors.brand
                  : deal.kind === 'online'
                  ? colors.tint
                  : colors.success,
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
                size={16}
                color={isLockedVip ? colors.onBrand : '#FFFFFF'}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: isLockedVip ? colors.onBrand : '#FFFFFF',
                }}
              >
                {isLockedVip
                  ? 'Liberar Bug VIP'
                  : deal.kind === 'online'
                  ? 'Pegar Promoção'
                  : '+ Na Minha Lista'}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Link.Trigger>

      <Link.Preview />

      <Link.Menu>
        <Link.MenuAction
          title={deal.kind === 'online' ? 'Abrir oferta na loja' : 'Adicionar à Lista de Compras'}
          icon={deal.kind === 'online' ? 'safari' : 'cart.badge.plus'}
          onPress={handleOpenAffiliate}
        />
        <Link.MenuAction
          title="Esquentar oferta (+10°)"
          icon="flame"
          onPress={() => voteDeal(deal.id, 10)}
        />
        <Link.MenuAction
          title="Criar alerta para este produto"
          icon="bell.badge"
          onPress={() => {
            const firstWords = deal.title.split(' ').slice(0, 2).join(' ');
            addAlert(firstWords, deal.dealPrice, deal.kind);
            Alert.alert('Alerta criado!', `Avisaremos quando "${firstWords}" baixar de preço.`);
          }}
        />
        <Link.MenuAction
          title="Compartilhar promoção"
          icon="square.and.arrow.up"
          onPress={handleShare}
        />
      </Link.Menu>
    </Link>
  );
}
