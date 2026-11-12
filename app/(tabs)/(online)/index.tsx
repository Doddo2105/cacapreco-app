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
import { ONLINE_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { isSupabaseConfigured } from '@/services/supabase';
import { colors } from '@/theme/colors';
import { haptics } from '@/utils/format';

export default function OnlineDealsScreen() {
  useColorScheme();
  const router = useRouter();
  const { onlineDeals, settings, isLoading, refresh, matchedAlerts } = useApp();

  const [category, setCategory] = useState('Todas');
  const [storeFilter, setStoreFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const onlineStores = useMemo(
    () => STORES.filter((s) => s.kind === 'online'),
    []
  );

  const triggeredCount = useMemo(
    () => matchedAlerts.reduce((acc, m) => acc + m.deals.length, 0),
    [matchedAlerts]
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
        {/* Top Status & VIP Header Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                borderCurve: 'continuous',
                backgroundColor: colors.tint,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sf="flame.fill" md="local-fire-department" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                Radar de Cupons & Achadinhos
              </Text>
              <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                {isSupabaseConfigured ? 'Supabase ao vivo' : 'Modo local'} ·{' '}
                {triggeredCount > 0
                  ? `${triggeredCount} alertas atingiram sua meta!`
                  : 'Monitorando ofertas'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              haptics.tap();
              router.push('/paywall' as any);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: settings.isVip ? colors.success : colors.brand,
            }}
          >
            <Icon
              sf={settings.isVip ? 'checkmark.seal.fill' : 'bolt.fill'}
              md={settings.isVip ? 'verified' : 'bolt'}
              size={14}
              color={settings.isVip ? '#FFFFFF' : colors.onBrand}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '800',
                color: settings.isVip ? '#FFFFFF' : colors.onBrand,
              }}
            >
              {settings.isVip ? 'VIP ATIVO' : 'FURA-FILA VIP'}
            </Text>
          </Pressable>
        </View>

        {/* Action Banner: Post Online Deal with AI */}
        <Pressable
          onPress={() => {
            haptics.tap();
            router.push({ pathname: '/deal/new', params: { kind: 'online' } } as any);
          }}
          style={{
            backgroundColor: colors.tint,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)',
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.onTint }}>
              + Cadastrar Cupom ou Oferta com IA
            </Text>
            <Text style={{ fontSize: 12, color: colors.onTint, opacity: 0.9 }}>
              Cole o texto da Amazon, Shopee ou Mercado Livre e o Gemini formata
            </Text>
          </View>
          <Icon sf="sparkles" md="auto-awesome" size={22} color={colors.onTint} />
        </Pressable>

        {/* Store Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => {
              haptics.tap();
              setStoreFilter('Todas');
            }}
            style={{
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: storeFilter === 'Todas' ? colors.label : colors.card,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: storeFilter === 'Todas' ? colors.background : colors.secondaryLabel,
              }}
            >
              Todas as Lojas
            </Text>
          </Pressable>

          {onlineStores.map((st) => {
            const active = storeFilter === st.name;
            return (
              <Pressable
                key={st.name}
                onPress={() => {
                  haptics.tap();
                  setStoreFilter(active ? 'Todas' : st.name);
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

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {ONLINE_CATEGORIES.map((cat) => {
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

        {/* Deals List */}
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
            <Icon sf="tag" md="local-offer" size={32} color={colors.secondaryLabel} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
              Nenhuma promoção neste filtro
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.secondaryLabel,
                textAlign: 'center',
              }}
            >
              Tente escolher outra categoria ou publique uma oferta usando o botão acima.
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
        placeholder="Buscar produto, loja ou cupom"
        onChangeText={(e) => setSearch(e.nativeEvent.text)}
        onCancelButtonPress={() => setSearch('')}
      />
    </>
  );
}
