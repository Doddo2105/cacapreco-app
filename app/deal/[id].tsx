import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, Share, Text, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedCurrency } from '@/components/animated-currency';
import { CouponTicket } from '@/components/coupon-ticket';
import { EmptyState } from '@/components/empty-state';
import { GradientButton } from '@/components/gradient-button';
import { HeatButton, HOT_THRESHOLD } from '@/components/heat-button';
import { Icon } from '@/components/icon';
import { enterUp, ProgressBar } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { useToast } from '@/components/toast';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import {
  buildAffiliateLink,
  calcDiscountPercent,
  formatCurrency,
  formatRelativeTime,
  haptics,
} from '@/utils/format';

/** Temperature at which the meter is completely full. */
const METER_MAX = 600;

export default function DealDetailScreen() {
  useColorScheme();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, deals, getDeal, voteDeal, addShoppingItem, addAlert } = useApp();

  const deal = id ? getDeal(id) : undefined;

  if (!deal) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: colors.background,
          padding: 24,
        }}
      >
        <EmptyState
          sf="tag.slash"
          md="search-off"
          title="Oferta não encontrada"
          message="Ela pode ter expirado ou sido removida. Volte para ver as promoções de hoje."
        />
      </View>
    );
  }

  const store = getStoreMeta(deal.storeName);
  const discountPct = calcDiscountPercent(deal.originalPrice, deal.dealPrice);
  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);
  const isLockedVip = deal.isVipEarly && !settings.isVip;
  const addsToList = deal.kind === 'mercado' && !deal.affiliateUrl;
  const isHot = deal.temperature >= HOT_THRESHOLD;

  // Find competing offers for the same product across other stores
  const firstWord = deal.title.split(' ')[0]?.toLowerCase() ?? '';
  const competingDeals = deals.filter(
    (d) =>
      d.id !== deal.id &&
      firstWord.length > 3 &&
      d.title.toLowerCase().includes(firstWord)
  );

  const openPaywall = () =>
    router.push({
      pathname: '/paywall',
      params: {
        reason: 'Desbloqueie links e cupons de Bugs de Preço em tempo real com o CaçaPreço VIP.',
      },
    } as any);

  const addToBasket = () => {
    addShoppingItem(deal.title, 1, deal.unit);
    haptics.success();
    toast.show({
      title: 'Adicionado à sua cesta',
      message: deal.title,
      sf: 'cart.fill.badge.plus',
      md: 'add-shopping-cart',
    });
  };

  const handlePrimaryAction = async () => {
    if (isLockedVip) {
      haptics.tap();
      openPaywall();
      return;
    }
    if (addsToList) {
      addToBasket();
      return;
    }
    haptics.tap();
    const url = buildAffiliateLink(deal.affiliateUrl, deal.storeName, settings);
    await Linking.openURL(url);
  };

  const handleMonitor = () => {
    const shortName = deal.title.split(' ').slice(0, 2).join(' ');
    addAlert(shortName, deal.dealPrice, deal.kind);
    haptics.success();
    toast.show({
      title: 'Alerta criado',
      message: `Monitorando "${shortName}" para você.`,
      sf: 'bell.badge.fill',
      md: 'notifications-active',
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: deal.storeName,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartilhar oferta"
              hitSlop={10}
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
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
      >
        {/* Title block */}
        <Animated.View entering={enterUp(0)} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: store.color,
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Icon sf={store.sf} md={store.md} size={14} color="#FFFFFF" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>
                {deal.storeName}
              </Text>
            </View>
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: colors.secondaryLabel }}>
              {deal.category} · {formatRelativeTime(deal.createdAt)}
            </Text>
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

          <Text
            selectable
            style={{ fontSize: 23, fontWeight: '800', lineHeight: 29, color: colors.label }}
          >
            {deal.title}
          </Text>

          {deal.description ? (
            <Text selectable style={{ fontSize: 15, lineHeight: 21, color: colors.secondaryLabel }}>
              {deal.description}
            </Text>
          ) : null}
        </Animated.View>

        {/* Price hero */}
        <Animated.View entering={enterUp(1)}>
          <View
            style={[
              {
                borderRadius: 26,
                borderCurve: 'continuous',
                padding: 18,
                gap: 12,
                boxShadow: shadows.money,
              },
              gradientBg(gradients.moneyHero),
            ]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}
            >
              <View style={{ gap: 1, flexShrink: 1 }}>
                {savings > 0 ? (
                  <Text
                    style={{
                      fontSize: 15,
                      color: 'rgba(255, 255, 255, 0.75)',
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
                      fontSize: 42,
                      fontWeight: '900',
                      letterSpacing: -1,
                      color: '#FFFFFF',
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatCurrency(deal.dealPrice)}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                    /{deal.unit}
                  </Text>
                </View>
              </View>

              {discountPct > 0 ? (
                <View
                  style={[
                    {
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 12,
                      borderCurve: 'continuous',
                      boxShadow: shadows.hot,
                    },
                    gradientBg(gradients.hot),
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 19,
                      fontWeight: '900',
                      color: '#FFFFFF',
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    -{discountPct}%
                  </Text>
                </View>
              ) : null}
            </View>

            {savings > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: palette.lime,
                }}
              >
                <Icon sf="arrow.down.right" md="trending-down" size={14} color={palette.emeraldDark} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: palette.emeraldDark }}>
                  Você economiza{' '}
                </Text>
                <AnimatedCurrency
                  value={savings}
                  style={{ fontSize: 15, fontWeight: '900', color: palette.emeraldDark }}
                />
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* Temperature */}
        <Animated.View entering={enterUp(2)}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.label }}>
                  {isHot ? 'Oferta pegando fogo' : 'Essa oferta vale a pena?'}
                </Text>
                <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                  Toque na chama para esquentar
                </Text>
              </View>
              <HeatButton
                size="lg"
                temperature={deal.temperature}
                delta={10}
                onVote={() => voteDeal(deal.id, 10)}
              />
            </View>
            <ProgressBar progress={deal.temperature / METER_MAX} gradient={gradients.hot} />
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={enterUp(3)} style={{ gap: 10 }}>
          {deal.couponCode ? (
            <CouponTicket
              size="lg"
              code={deal.couponCode}
              locked={isLockedVip}
              onLockedPress={openPaywall}
            />
          ) : null}

          <GradientButton
            size="lg"
            tone={isLockedVip ? 'gold' : addsToList ? 'money' : 'hot'}
            label={
              isLockedVip
                ? 'Liberar Bug de Preço no VIP'
                : addsToList
                ? 'Adicionar à minha cesta'
                : `Pegar oferta na ${deal.storeName}`
            }
            sf={isLockedVip ? 'lock.fill' : addsToList ? 'cart.badge.plus' : 'arrow.up.right'}
            md={isLockedVip ? 'lock' : addsToList ? 'add-shopping-cart' : 'open-in-new'}
            onPress={handlePrimaryAction}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!addsToList ? (
              <SecondaryAction
                label="Pôr na lista"
                sf="checklist"
                md="playlist-add"
                onPress={addToBasket}
              />
            ) : null}
            <SecondaryAction
              label="Monitorar preço"
              sf="bell.badge"
              md="notifications"
              onPress={handleMonitor}
            />
          </View>
        </Animated.View>

        {/* Competing offers */}
        {competingDeals.length > 0 ? (
          <Animated.View entering={enterUp(4)}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 22,
                borderCurve: 'continuous',
                padding: 16,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label, marginBottom: 4 }}>
                Compare em outras lojas
              </Text>
              {competingDeals.map((other, index) => {
                const cheaper = other.dealPrice < deal.dealPrice;
                return (
                  <Pressable
                    key={other.id}
                    accessibilityRole="button"
                    onPress={() => router.replace(`/deal/${other.id}` as any)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      paddingVertical: 11,
                      borderTopWidth: index === 0 ? 0 : 0.5,
                      borderTopColor: colors.separator,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                        {other.storeName}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 13, color: colors.secondaryLabel }}>
                        {other.title}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '800',
                          color: cheaper ? colors.success : colors.label,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {formatCurrency(other.dealPrice)}
                      </Text>
                      {cheaper ? (
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>
                          mais barato
                        </Text>
                      ) : null}
                    </View>
                    <Icon sf="chevron.right" md="chevron-right" size={12} color={colors.tertiaryLabel} />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>
    </>
  );
}

function SecondaryAction({
  label,
  sf,
  md,
  onPress,
}: {
  label: string;
  sf: string;
  md: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      containerStyle={{ flex: 1 }}
      onPress={onPress}
      style={{
        minHeight: 48,
        backgroundColor: colors.card,
        borderRadius: 14,
        borderCurve: 'continuous',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
      }}
    >
      <Icon sf={sf} md={md} size={17} color={colors.tint} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.label }}>{label}</Text>
    </PressableScale>
  );
}
