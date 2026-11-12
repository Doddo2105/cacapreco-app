import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AiBanner } from '@/components/ai-banner';
import { AnimatedCurrency } from '@/components/animated-currency';
import { DealCard } from '@/components/deal-card';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { HeroStat } from '@/components/hero-stat';
import { Icon } from '@/components/icon';
import { Appear, enterUp, LiveDot, reflow } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { ONLINE_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import { calcDiscountPercent, haptics } from '@/utils/format';

export default function OnlineDealsScreen() {
  useColorScheme();
  const router = useRouter();
  const { onlineDeals, settings, isLoading, refresh, matchedAlerts } = useApp();

  const [category, setCategory] = useState('Todas');
  const [storeFilter, setStoreFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const onlineStores = useMemo(() => STORES.filter((s) => s.kind === 'online'), []);

  const triggeredCount = useMemo(
    () => matchedAlerts.reduce((acc, m) => acc + m.deals.length, 0),
    [matchedAlerts]
  );

  const totalSavings = useMemo(
    () => onlineDeals.reduce((sum, d) => sum + Math.max(0, d.originalPrice - d.dealPrice), 0),
    [onlineDeals]
  );

  const bestDiscount = useMemo(
    () =>
      onlineDeals.reduce(
        (max, d) => Math.max(max, calcDiscountPercent(d.originalPrice, d.dealPrice)),
        0
      ),
    [onlineDeals]
  );

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return onlineDeals.filter((d) => {
      if (category !== 'Todas' && d.category !== category) return false;
      if (storeFilter !== 'Todas' && d.storeName !== storeFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.storeName.toLowerCase().includes(q) ||
        (d.couponCode ?? '').toLowerCase().includes(q)
      );
    });
  }, [onlineDeals, category, storeFilter, search]);

  const hasFilters = category !== 'Todas' || storeFilter !== 'Todas' || search.trim() !== '';

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={palette.emerald}
            colors={[palette.emerald]}
          />
        }
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40, gap: 16 }}
      >
        {/* Savings hero */}
        <Animated.View entering={enterUp(0)} style={{ paddingHorizontal: 16 }}>
          <View
            style={[
              {
                borderRadius: 26,
                borderCurve: 'continuous',
                padding: 18,
                gap: 14,
                boxShadow: shadows.money,
              },
              gradientBg(gradients.moneyHero),
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <LiveDot color={palette.lime} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: palette.mint }}>
                  {isSupabaseConfigured ? 'RADAR AO VIVO' : 'RADAR · MODO LOCAL'}
                </Text>
              </View>

              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={settings.isVip ? 'VIP ativo' : 'Conhecer o plano VIP'}
                hitSlop={8}
                onPress={() => {
                  haptics.tap();
                  router.push('/paywall' as any);
                }}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 999,
                  },
                  gradientBg(gradients.gold),
                ]}
              >
                <Icon
                  sf={settings.isVip ? 'checkmark.seal.fill' : 'bolt.fill'}
                  md={settings.isVip ? 'verified' : 'bolt'}
                  size={14}
                  color={colors.onBrand}
                />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.onBrand }}>
                  {settings.isVip ? 'VIP ativo' : 'Seja VIP'}
                </Text>
              </PressableScale>
            </View>

            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)' }}>
                Economia disponível agora
              </Text>
              <AnimatedCurrency
                value={totalSavings}
                style={{
                  fontSize: 40,
                  fontWeight: '900',
                  letterSpacing: -1,
                  color: palette.lime,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <HeroStat sf="tag.fill" md="local-offer" label={`${onlineDeals.length} ofertas`} />
              {bestDiscount > 0 ? (
                <HeroStat sf="arrow.down.right" md="trending-down" label={`até -${bestDiscount}%`} />
              ) : null}
              {triggeredCount > 0 ? (
                <HeroStat
                  sf="bell.badge.fill"
                  md="notifications-active"
                  label={`${triggeredCount} ${triggeredCount === 1 ? 'alerta bateu' : 'alertas bateram'} a meta`}
                  highlight
                />
              ) : null}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={enterUp(1)} style={{ paddingHorizontal: 16 }}>
          <AiBanner
            title="Publicar oferta com IA"
            subtitle="Cole o texto da Amazon, Shopee ou Mercado Livre e o Gemini organiza"
            sf="sparkles"
            md="auto-awesome"
            onPress={() => {
              haptics.tap();
              router.push({ pathname: '/deal/new', params: { kind: 'online' } } as any);
            }}
          />
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={enterUp(2)} style={{ gap: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            <FilterChip
              label="Todas as lojas"
              active={storeFilter === 'Todas'}
              activeColor={palette.night}
              onPress={() => setStoreFilter('Todas')}
            />
            {onlineStores.map((st) => (
              <FilterChip
                key={st.name}
                label={st.name}
                sf={st.sf}
                md={st.md}
                activeColor={st.color}
                active={storeFilter === st.name}
                onPress={() => setStoreFilter(storeFilter === st.name ? 'Todas' : st.name)}
              />
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {ONLINE_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                active={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Deals */}
        <Animated.View layout={reflow} style={{ paddingHorizontal: 16, gap: 12 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.secondaryLabel,
              fontVariant: ['tabular-nums'],
            }}
          >
            {filteredDeals.length} {filteredDeals.length === 1 ? 'OFERTA' : 'OFERTAS'}
            {hasFilters ? ' NO FILTRO' : ' HOJE'}
          </Text>

          {filteredDeals.length === 0 ? (
            <EmptyState
              sf="tag"
              md="local-offer"
              title="Nenhuma oferta por aqui"
              message={
                hasFilters
                  ? 'Tente outra loja ou categoria — ou publique a oferta que você encontrou.'
                  : 'Publique a primeira oferta colando o texto da promoção.'
              }
            />
          ) : (
            filteredDeals.map((deal, index) => (
              <Appear key={deal.id} index={index + 3}>
                <DealCard deal={deal} />
              </Appear>
            ))
          )}
        </Animated.View>
      </ScrollView>

      <Stack.SearchBar
        placeholder="Buscar produto, loja ou cupom"
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
      />
    </>
  );
}
