import { Link, useRouter } from 'expo-router';
import { Linking, Share, Text, useColorScheme, View } from 'react-native';
import { CouponTicket } from '@/components/coupon-ticket';
import { GradientButton } from '@/components/gradient-button';
import { HeatButton } from '@/components/heat-button';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { useToast } from '@/components/toast';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, shadows } from '@/theme/colors';
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
  const toast = useToast();
  const { settings, voteDeal, addShoppingItem, addAlert } = useApp();

  const store = getStoreMeta(deal.storeName);
  const discountPct = calcDiscountPercent(deal.originalPrice, deal.dealPrice);
  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);
  const isLockedVip = deal.isVipEarly && !settings.isVip;
  const addsToList = deal.kind === 'mercado' && !deal.affiliateUrl;

  const openPaywall = (reason: string) =>
    router.push({ pathname: '/paywall', params: { reason } } as any);

  const handlePrimary = async () => {
    haptics.tap();
    if (isLockedVip) {
      openPaywall(
        'Esta é uma oferta "Bug de Preço" com acesso antecipado exclusivo para assinantes VIP.'
      );
      return;
    }

    if (addsToList) {
      addShoppingItem(deal.title, 1, deal.unit);
      haptics.success();
      toast.show({
        title: 'Adicionado à sua cesta',
        message: `${deal.title} · ${deal.storeName}`,
        sf: 'cart.fill.badge.plus',
        md: 'add-shopping-cart',
      });
      return;
    }

    const url = buildAffiliateLink(deal.affiliateUrl, deal.storeName, settings);
    await Linking.openURL(url);
  };

  const handleShare = async () => {
    await Share.share({
      message: `${deal.title} por ${formatCurrency(deal.dealPrice)} na ${deal.storeName}${
        deal.couponCode ? ` (Cupom: ${deal.couponCode})` : ''
      }`,
    });
  };

  const handleCreateAlert = () => {
    const firstWords = deal.title.split(' ').slice(0, 2).join(' ');
    addAlert(firstWords, deal.dealPrice, deal.kind);
    haptics.success();
    toast.show({
      title: 'Alerta criado',
      message: `Avisaremos quando "${firstWords}" baixar de preço.`,
      sf: 'bell.badge.fill',
      md: 'notifications-active',
    });
  };

  return (
    <Link href={`/deal/${deal.id}` as any} asChild>
      <Link.Trigger>
        <PressableScale
          scaleTo={0.985}
          style={{
            backgroundColor: colors.card,
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
            boxShadow: shadows.card,
          }}
        >
          {/* Store · category · temperature */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                backgroundColor: store.color,
              }}
            >
              <Icon sf={store.sf} md={store.md} size={13} color="#FFFFFF" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                {deal.storeName}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{ flex: 1, fontSize: 12, color: colors.secondaryLabel }}
            >
              {deal.category} · {formatRelativeTime(deal.createdAt)}
            </Text>
            <HeatButton
              temperature={deal.temperature}
              delta={5}
              onVote={() => voteDeal(deal.id, 5)}
            />
          </View>

          {deal.isVipEarly ? (
            <View
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                  alignSelf: 'flex-start',
                },
                gradientBg(gradients.gold),
              ]}
            >
              <Icon sf="bolt.fill" md="bolt" size={13} color={colors.onBrand} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onBrand }}>
                BUG DE PREÇO · ACESSO ANTECIPADO VIP
              </Text>
            </View>
          ) : null}

          <View style={{ gap: 4 }}>
            <Text
              numberOfLines={3}
              style={{ fontSize: 17, fontWeight: '700', color: colors.label, lineHeight: 23 }}
            >
              {deal.title}
            </Text>
            {deal.description ? (
              <Text
                numberOfLines={2}
                style={{ fontSize: 14, color: colors.secondaryLabel, lineHeight: 19 }}
              >
                {deal.description}
              </Text>
            ) : null}
          </View>

          {/* Price: the hero of the card */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <View style={{ gap: 1, flexShrink: 1 }}>
              {savings > 0 ? (
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.secondaryLabel,
                    textDecorationLine: 'line-through',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(deal.originalPrice)}
                </Text>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                <Text
                  selectable
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    letterSpacing: -0.5,
                    color: colors.success,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(deal.dealPrice)}
                </Text>
                <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>/{deal.unit}</Text>
              </View>
            </View>

            {discountPct > 0 ? (
              <View style={{ alignItems: 'flex-end', gap: 5 }}>
                <View
                  style={[
                    {
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                      borderCurve: 'continuous',
                      boxShadow: shadows.hot,
                    },
                    gradientBg(gradients.hot),
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '900',
                      color: '#FFFFFF',
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    -{discountPct}%
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.success,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  Economize {formatCurrency(savings)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Coupon + primary action */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {deal.couponCode ? (
              <CouponTicket
                code={deal.couponCode}
                locked={isLockedVip}
                onLockedPress={() =>
                  openPaywall('Libere o cupom exclusivo de Bug de Preço com o CaçaPreço VIP.')
                }
              />
            ) : null}

            <GradientButton
              containerStyle={{ flex: 1 }}
              tone={isLockedVip ? 'gold' : addsToList ? 'money' : 'hot'}
              label={isLockedVip ? 'Liberar no VIP' : addsToList ? 'Pôr na cesta' : 'Pegar oferta'}
              sf={isLockedVip ? 'lock.fill' : addsToList ? 'cart.badge.plus' : 'arrow.up.right'}
              md={isLockedVip ? 'lock' : addsToList ? 'add-shopping-cart' : 'open-in-new'}
              onPress={(e) => {
                e.stopPropagation();
                handlePrimary();
              }}
            />
          </View>
        </PressableScale>
      </Link.Trigger>

      <Link.Preview />

      <Link.Menu>
        <Link.MenuAction
          title={addsToList ? 'Adicionar à cesta' : 'Abrir oferta na loja'}
          icon={addsToList ? 'cart.badge.plus' : 'safari'}
          onPress={handlePrimary}
        />
        <Link.MenuAction
          title="Esquentar oferta (+10°)"
          icon="flame"
          onPress={() => voteDeal(deal.id, 10)}
        />
        <Link.MenuAction
          title="Criar alerta para este produto"
          icon="bell.badge"
          onPress={handleCreateAlert}
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
