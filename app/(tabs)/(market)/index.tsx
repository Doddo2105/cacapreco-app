import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AiBanner } from '@/components/ai-banner';
import { AnimatedCurrency } from '@/components/animated-currency';
import { DealCard } from '@/components/deal-card';
import { EmptyState } from '@/components/empty-state';
import { FilterChip } from '@/components/filter-chip';
import { GradientButton } from '@/components/gradient-button';
import { HeroStat } from '@/components/hero-stat';
import { Icon } from '@/components/icon';
import { Appear, enterUp, reflow } from '@/components/motion';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedTabs } from '@/components/segmented-tabs';
import { MARKET_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import { formatCurrency, haptics } from '@/utils/format';

type MarketSubTab = 'precos' | 'ia';

export default function MarketDealsScreen() {
  useColorScheme();
  const router = useRouter();
  const { marketDeals, storeRankings, settings, isLoading, refresh } = useApp();

  const [subTab, setSubTab] = useState<MarketSubTab>('precos');
  const [category, setCategory] = useState('Todos');
  const [storeFilter, setStoreFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const marketStores = useMemo(() => STORES.filter((s) => s.kind === 'mercado'), []);

  const cheapestStore = storeRankings[0];

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return marketDeals.filter((d) => {
      if (category !== 'Todos' && d.category !== category) return false;
      if (storeFilter !== 'Todos' && d.storeName !== storeFilter) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.storeName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    });
  }, [marketDeals, category, storeFilter, search]);

  const hasFilters = category !== 'Todos' || storeFilter !== 'Todos' || search.trim() !== '';

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
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 48, gap: 20 }}
      >
        <ScreenHeader
          eyebrow={`Encartes · ${settings.city}`}
          eyebrowSf="location.fill"
          eyebrowMd="location-on"
          title="Mercados &"
          accent="Atacado"
          subtitle={`${marketDeals.length} preços de corredor comparados hoje`}
          actionLabel="Encarte"
          actionSf="doc.text.viewfinder"
          actionMd="document-scanner"
          onActionPress={() =>
            router.push({ pathname: '/deal/new', params: { kind: 'mercado' } } as any)
          }
          searchValue={search}
          searchPlaceholder="Buscar picanha, cerveja, café, arroz..."
          onSearchChange={setSearch}
        />

        {/* Cheapest supermarket hero */}
        {cheapestStore ? (
          <Animated.View entering={enterUp(0)} style={{ paddingHorizontal: 16 }}>
            <View
              style={[
                {
                  borderRadius: 26,
                  borderCurve: 'continuous',
                  padding: 20,
                  gap: 14,
                  boxShadow: shadows.money,
                },
                gradientBg(gradients.moneyHero),
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={[
                    {
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    gradientBg(gradients.gold),
                  ]}
                >
                  <Icon sf="trophy.fill" md="emoji-events" size={24} color={colors.onBrand} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.mint }}>
                    MAIS BARATO HOJE · {settings.city.toUpperCase()}
                  </Text>
                  <Text
                    selectable
                    numberOfLines={1}
                    style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF' }}
                  >
                    {cheapestStore.storeName}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 4 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  Sua cesta inteira sai por
                </Text>
                <AnimatedCurrency
                  value={cheapestStore.totalPrice}
                  style={{
                    fontSize: 38,
                    fontWeight: '900',
                    letterSpacing: -1,
                    color: palette.lime,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <HeroStat
                  sf="arrow.down.right"
                  md="trending-down"
                  label={`Você economiza ${formatCurrency(cheapestStore.totalSavings)}`}
                  highlight
                />
                <HeroStat
                  sf="cart.fill"
                  md="shopping-cart"
                  label={`${marketDeals.length} preços comparados`}
                />
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Internal sub-tabs to separate Supermarket Prices from AI Flyer Scanner */}
        <View style={{ paddingHorizontal: 16 }}>
          <SegmentedTabs<MarketSubTab>
            value={subTab}
            onChange={setSubTab}
            options={[
              {
                key: 'precos',
                label: 'Preços de Hoje',
                sf: 'cart.fill',
                md: 'storefront',
                badge: filteredDeals.length,
              },
              {
                key: 'ia',
                label: 'Ler Encarte IA',
                sf: 'doc.text.viewfinder',
                md: 'document-scanner',
              },
            ]}
          />
        </View>

        {subTab === 'ia' ? (
          <Animated.View entering={enterUp(1)} style={{ paddingHorizontal: 16, gap: 18 }}>
            <AiBanner
              title="Ler encarte com IA"
              subtitle="Cole vários preços do Atacadão, Assaí ou Carrefour de uma vez"
              sf="doc.text.viewfinder"
              md="document-scanner"
              onPress={() => {
                haptics.tap();
                router.push({ pathname: '/deal/new', params: { kind: 'mercado' } } as any);
              }}
            />

            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 24,
                borderCurve: 'continuous',
                padding: 20,
                gap: 14,
                boxShadow: shadows.card,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.label }}>
                Importe encartes inteiros de uma só vez
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.secondaryLabel }}>
                Digite ou cole uma lista de produtos e preços do folheto do supermercado. O Gemini
                separa cada item, identifica a categoria e atualiza o comparador da sua cesta
                automaticamente.
              </Text>
              <GradientButton
                size="lg"
                tone="ai"
                label="Abrir leitor de encarte"
                sf="doc.text.viewfinder"
                md="document-scanner"
                onPress={() => {
                  haptics.tap();
                  router.push({ pathname: '/deal/new', params: { kind: 'mercado' } } as any);
                }}
              />
            </View>
          </Animated.View>
        ) : (
          <>
            {/* Filters with generous spacing */}
            <Animated.View entering={enterUp(1)} style={{ gap: 14 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
              >
                <FilterChip
                  label="Todos os mercados"
                  active={storeFilter === 'Todos'}
                  activeColor={palette.night}
                  onPress={() => setStoreFilter('Todos')}
                />
                {marketStores.map((st) => (
                  <FilterChip
                    key={st.name}
                    label={st.name}
                    sf={st.sf}
                    md={st.md}
                    activeColor={st.color}
                    active={storeFilter === st.name}
                    onPress={() => setStoreFilter(storeFilter === st.name ? 'Todos' : st.name)}
                  />
                ))}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
              >
                {MARKET_CATEGORIES.map((cat) => (
                  <FilterChip
                    key={cat}
                    label={cat}
                    active={category === cat}
                    onPress={() => setCategory(cat)}
                  />
                ))}
              </ScrollView>
            </Animated.View>

            {/* Deals with more breathing room between cards */}
            <Animated.View layout={reflow} style={{ paddingHorizontal: 16, gap: 18 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: colors.secondaryLabel,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {filteredDeals.length} {filteredDeals.length === 1 ? 'PREÇO' : 'PREÇOS'}
                {hasFilters ? ' NO FILTRO' : ' DE ENCARTE'}
              </Text>

              {filteredDeals.length === 0 ? (
                <EmptyState
                  sf="cart"
                  md="storefront"
                  title="Nenhum preço neste corredor"
                  message="Cole os preços do encarte da sua cidade em “Ler Encarte IA” e eles aparecem aqui."
                />
              ) : (
                filteredDeals.map((deal, index) => (
                  <Appear key={deal.id} index={index + 2}>
                    <DealCard deal={deal} />
                  </Appear>
                ))
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>

      <Stack.SearchBar
        placeholder="Buscar picanha, cerveja, café, arroz..."
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
      />
    </>
  );
}
