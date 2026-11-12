import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { DealCard } from '@/components/deal-card';
import { Icon } from '@/components/icon';
import { MARKET_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import { formatCurrency, haptics } from '@/utils/format';

export default function MarketDealsScreen() {
  useColorScheme();
  const router = useRouter();
  const { marketDeals, storeRankings, settings, isLoading, refresh } = useApp();

  const [category, setCategory] = useState('Todos');
  const [storeFilter, setStoreFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  const marketStores = useMemo(
    () => STORES.filter((s) => s.kind === 'mercado'),
    []
  );

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

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          gap: 14,
        }}
      >
        {/* Cheapest Supermarket Summary Banner */}
        {cheapestStore ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon sf="trophy.fill" md="emoji-events" size={16} color={colors.brand} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: colors.secondaryLabel }}>
                  MERCADO MAIS BARATO HOJE ({settings.city.toUpperCase()})
                </Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                {cheapestStore.storeName}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.secondaryLabel,
                  fontVariant: ['tabular-nums'],
                }}
              >
                Sua cesta sai por{' '}
                <Text style={{ fontWeight: '800', color: colors.success }}>
                  {formatCurrency(cheapestStore.totalPrice)}
                </Text>{' '}
                (economia de {formatCurrency(cheapestStore.totalSavings)})
              </Text>
            </View>
          </View>
        ) : null}

        {/* Scan / Paste Supermarket Flyer with AI */}
        <Pressable
          onPress={() => {
            haptics.tap();
            router.push({ pathname: '/deal/new', params: { kind: 'mercado' } } as any);
          }}
          style={{
            backgroundColor: colors.success,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
              + Ler Encarte / Preços de Mercado com IA
            </Text>
            <Text style={{ fontSize: 12, color: '#FFFFFF', opacity: 0.9 }}>
              Digite ou cole vários preços do Atacadão, Assaí ou Carrefour de uma vez
            </Text>
          </View>
          <Icon sf="doc.text.viewfinder" md="document-scanner" size={22} color="#FFFFFF" />
        </Pressable>

        {/* Supermarket Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => {
              haptics.tap();
              setStoreFilter('Todos');
            }}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: storeFilter === 'Todos' ? colors.label : colors.card,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: storeFilter === 'Todos' ? colors.background : colors.secondaryLabel,
              }}
            >
              Todos os Mercados
            </Text>
          </Pressable>

          {marketStores.map((st) => {
            const active = storeFilter === st.name;
            return (
              <Pressable
                key={st.name}
                onPress={() => {
                  haptics.tap();
                  setStoreFilter(active ? 'Todos' : st.name);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: active ? st.color : colors.card,
                }}
              >
                <Icon
                  sf={st.sf}
                  md={st.md}
                  size={13}
                  color={active ? '#FFFFFF' : st.color}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: active ? '#FFFFFF' : colors.label,
                  }}
                >
                  {st.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Aisle / Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {MARKET_CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  haptics.tap();
                  setCategory(cat);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? colors.tint : colors.card,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: active ? colors.onTint : colors.secondaryLabel,
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Market Deals List */}
        {filteredDeals.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 32,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon sf="cart" md="storefront" size={32} color={colors.secondaryLabel} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
              Nenhuma oferta neste corredor
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.secondaryLabel,
                textAlign: 'center',
              }}
            >
              Adicione preços do encarte da sua cidade usando o botão verde acima.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </View>
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
