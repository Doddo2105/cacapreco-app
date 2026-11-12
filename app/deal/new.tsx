import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { MARKET_CATEGORIES, ONLINE_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { newId } from '@/services/database';
import { parseDealsWithAi } from '@/services/gemini-ai';
import { colors } from '@/theme/colors';
import type { Deal, DealKind } from '@/types';
import { haptics, parseNumber } from '@/utils/format';

export default function NewDealScreen() {
  useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: DealKind }>();
  const { settings, addDeals } = useApp();

  const [kind, setKind] = useState<DealKind>(params.kind === 'mercado' ? 'mercado' : 'online');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Manual form fields
  const [title, setTitle] = useState('');
  const [storeName, setStoreName] = useState(
    params.kind === 'mercado' ? 'Atacadão' : 'Amazon'
  );
  const [category, setCategory] = useState(
    params.kind === 'mercado' ? 'Mercearia' : 'Eletrônicos'
  );
  const [originalPrice, setOriginalPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [unit, setUnit] = useState('un');
  const [couponCode, setCouponCode] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isVipEarly, setIsVipEarly] = useState(false);

  const handleExtractWithAi = async () => {
    if (!aiText.trim()) {
      Alert.alert(
        'Cole o texto da oferta ou encarte',
        'Exemplo: "Atacadão: Picanha R$ 49,90/kg; Cerveja Heineken R$ 4,39; Arroz 5kg R$ 22,90" ou o texto de uma promoção da Shopee/Amazon.'
      );
      return;
    }

    haptics.tap();
    setAiLoading(true);
    try {
      const extracted = await parseDealsWithAi(aiText, kind, settings.city);
      await addDeals(extracted);
      haptics.success();
      Alert.alert(
        'Ofertas Publicadas!',
        `${extracted.length} ${
          extracted.length === 1 ? 'oferta foi adicionada' : 'ofertas foram adicionadas'
        } com sucesso.`
      );
      router.back();
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveManual = async () => {
    if (!title.trim() || !dealPrice.trim()) {
      Alert.alert('Campos obrigatórios', 'Informe o título do produto e o preço promocional.');
      return;
    }

    const price = parseNumber(dealPrice);
    const orig = parseNumber(originalPrice) || Number((price * 1.25).toFixed(2));

    const created: Deal = {
      id: newId(),
      kind,
      title: title.trim(),
      storeName,
      category,
      originalPrice: orig,
      dealPrice: price,
      unit: unit || 'un',
      couponCode: couponCode.trim() ? couponCode.trim().toUpperCase() : null,
      affiliateUrl: affiliateUrl.trim() || null,
      city: kind === 'mercado' ? settings.city : 'Brasil',
      description: description.trim(),
      temperature: 30,
      isVipEarly,
      createdAt: new Date().toISOString(),
    };

    await addDeals([created]);
    haptics.success();
    router.back();
  };

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 12,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.label,
  };

  const availableStores = STORES.filter((s) => s.kind === kind);
  const availableCategories = (
    kind === 'mercado' ? MARKET_CATEGORIES : ONLINE_CATEGORIES
  ).filter((c) => c !== 'Todas' && c !== 'Todos');

  return (
    <>
      <Stack.Screen
        options={{
          title: kind === 'mercado' ? 'Novo Encarte / Preço' : 'Nova Promoção / Cupom',
          headerRight: () => (
            <Pressable onPress={handleSaveManual} style={{ paddingHorizontal: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.tint }}>
                Publicar
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 48,
          gap: 16,
        }}
      >
        {/* Mode Switcher: Online vs Mercado */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['online', 'mercado'] as const).map((m) => {
            const active = kind === m;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  haptics.tap();
                  setKind(m);
                  setStoreName(m === 'mercado' ? 'Atacadão' : 'Amazon');
                  setCategory(m === 'mercado' ? 'Mercearia' : 'Eletrônicos');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  backgroundColor: active ? colors.tint : colors.card,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    color: active ? colors.onTint : colors.label,
                  }}
                >
                  {m === 'online' ? 'Cupom / Loja Online' : 'Supermercado Local'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Gemini AI Batch Extractor */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            borderCurve: 'continuous',
            padding: 16,
            gap: 10,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon sf="sparkles" md="auto-awesome" size={18} color={colors.brand} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label, flex: 1 }}>
              {kind === 'mercado'
                ? 'Leitor de Encarte em Lote com IA (Gemini)'
                : 'Importador Mágico de Promoção com IA'}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.secondaryLabel, lineHeight: 18 }}>
            {kind === 'mercado'
              ? 'Digite ou cole vários itens do encarte separados por linha (ex: "Atacadão: Leite Italac R$ 4,29; Café Pilão R$ 15,90; Picanha R$ 48,90 kg").'
              : 'Cole o texto de qualquer oferta do WhatsApp/Telegram com preço e cupom e a IA publica tudo formatado.'}
          </Text>
          <TextInput
            multiline
            placeholder="Cole aqui o texto da promoção ou vários itens do mercado..."
            placeholderTextColor={colors.secondaryLabel as string}
            value={aiText}
            onChangeText={setAiText}
            style={{
              ...inputStyle,
              minHeight: 84,
              textAlignVertical: 'top',
            }}
          />
          <Pressable
            onPress={handleExtractWithAi}
            disabled={aiLoading}
            style={{
              backgroundColor: colors.brand,
              borderRadius: 12,
              borderCurve: 'continuous',
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {aiLoading ? (
              <ActivityIndicator color={colors.onBrand} size="small" />
            ) : (
              <>
                <Icon sf="wand.and.stars" md="auto-fix-high" size={17} color={colors.onBrand} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.onBrand }}>
                  Extrair e Publicar Automaticamente
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Manual Form */}
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
            Ou preencha manualmente
          </Text>

          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
            Loja / Supermercado
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {availableStores.map((st) => {
              const active = storeName === st.name;
              return (
                <Pressable
                  key={st.name}
                  onPress={() => setStoreName(st.name)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? st.color : colors.fill,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
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

          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryLabel }}>
            Categoria
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {availableCategories.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{
                    paddingHorizontal: 13,
                    paddingVertical: 7,
                    borderRadius: 999,
                    backgroundColor: active ? colors.tint : colors.fill,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
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

          <TextInput
            placeholder="Nome do produto *"
            placeholderTextColor={colors.secondaryLabel as string}
            value={title}
            onChangeText={setTitle}
            style={inputStyle}
          />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              placeholder="De R$ (normal)"
              placeholderTextColor={colors.secondaryLabel as string}
              keyboardType="numeric"
              value={originalPrice}
              onChangeText={setOriginalPrice}
              style={[inputStyle, { flex: 1 }]}
            />
            <TextInput
              placeholder="Por R$ (oferta) *"
              placeholderTextColor={colors.secondaryLabel as string}
              keyboardType="numeric"
              value={dealPrice}
              onChangeText={setDealPrice}
              style={[inputStyle, { flex: 1 }]}
            />
            <TextInput
              placeholder="un / kg"
              placeholderTextColor={colors.secondaryLabel as string}
              value={unit}
              onChangeText={setUnit}
              style={[inputStyle, { width: 80 }]}
            />
          </View>

          <TextInput
            placeholder="Cupom (opcional, ex: GANHE20)"
            placeholderTextColor={colors.secondaryLabel as string}
            autoCapitalize="characters"
            value={couponCode}
            onChangeText={setCouponCode}
            style={inputStyle}
          />

          {kind === 'online' ? (
            <TextInput
              placeholder="Link da oferta (https://...)"
              placeholderTextColor={colors.secondaryLabel as string}
              autoCapitalize="none"
              value={affiliateUrl}
              onChangeText={setAffiliateUrl}
              style={inputStyle}
            />
          ) : null}

          <TextInput
            placeholder="Observação (ex: válido no app do mercado ou pagamento Pix)"
            placeholderTextColor={colors.secondaryLabel as string}
            value={description}
            onChangeText={setDescription}
            style={inputStyle}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.label }}>
                Marcar como &ldquo;Bug de Preço VIP&rdquo;
              </Text>
              <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>
                Exige assinatura VIP para desbloquear o cupom/link
              </Text>
            </View>
            <Switch value={isVipEarly} onValueChange={setIsVipEarly} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}
