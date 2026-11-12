import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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
import { FilterChip } from '@/components/filter-chip';
import { GradientButton } from '@/components/gradient-button';
import { Icon } from '@/components/icon';
import { useToast } from '@/components/toast';
import { MARKET_CATEGORIES, ONLINE_CATEGORIES, STORES } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { newId } from '@/services/database';
import { parseDealsWithAi } from '@/services/gemini-ai';
import { colors, palette, shadows } from '@/theme/colors';
import type { Deal, DealKind } from '@/types';
import { haptics, parseNumber } from '@/utils/format';

export default function NewDealScreen() {
  useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: DealKind }>();
  const { settings, addDeals } = useApp();
  const toast = useToast();

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
      router.back();
      toast.show({
        title: extracted.length === 1 ? 'Oferta publicada' : 'Ofertas publicadas',
        message: `${extracted.length} ${
          extracted.length === 1 ? 'oferta foi adicionada' : 'ofertas foram adicionadas'
        } pela IA.`,
        sf: 'sparkles',
        md: 'auto-awesome',
      });
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
    toast.show({ title: 'Oferta publicada', message: created.title });
  };

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 13,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
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
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  haptics.tap();
                  setKind(m);
                  setStoreName(m === 'mercado' ? 'Atacadão' : 'Amazon');
                  setCategory(m === 'mercado' ? 'Mercearia' : 'Eletrônicos');
                }}
                style={{
                  flex: 1,
                  minHeight: 48,
                  justifyContent: 'center',
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  backgroundColor: active ? palette.emeraldDeep : colors.card,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    color: active ? '#FFFFFF' : colors.label,
                  }}
                >
                  {m === 'online' ? 'Loja online' : 'Supermercado'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Gemini AI Batch Extractor */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
            boxShadow: shadows.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon sf="sparkles" md="auto-awesome" size={20} color={palette.violet} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label, flex: 1 }}>
              {kind === 'mercado' ? 'Ler encarte com IA' : 'Importar oferta com IA'}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.secondaryLabel, lineHeight: 20 }}>
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
              minHeight: 96,
              textAlignVertical: 'top',
            }}
          />
          <GradientButton
            size="lg"
            tone="ai"
            loading={aiLoading}
            label={aiLoading ? 'Lendo com o Gemini…' : 'Extrair e publicar'}
            sf="wand.and.stars"
            md="auto-fix-high"
            onPress={handleExtractWithAi}
          />
        </View>

        {/* Manual Form */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 22,
            borderCurve: 'continuous',
            padding: 16,
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
            Ou preencha manualmente
          </Text>

          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.secondaryLabel }}>
            Loja / Supermercado
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {availableStores.map((st) => (
              <View key={st.name} style={{ borderRadius: 999, backgroundColor: colors.fill }}>
                <FilterChip
                  label={st.name}
                  sf={st.sf}
                  md={st.md}
                  activeColor={st.color}
                  active={storeName === st.name}
                  onPress={() => setStoreName(st.name)}
                />
              </View>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.secondaryLabel }}>
            Categoria
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {availableCategories.map((cat) => (
              <View key={cat} style={{ borderRadius: 999, backgroundColor: colors.fill }}>
                <FilterChip
                  label={cat}
                  active={category === cat}
                  onPress={() => setCategory(cat)}
                />
              </View>
            ))}
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
              style={[inputStyle, { flex: 1, minWidth: 0 }]}
            />
            <TextInput
              placeholder="Por R$ (oferta) *"
              placeholderTextColor={colors.secondaryLabel as string}
              keyboardType="numeric"
              value={dealPrice}
              onChangeText={setDealPrice}
              style={[inputStyle, { flex: 1, minWidth: 0 }]}
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
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                Marcar como &ldquo;Bug de Preço VIP&rdquo;
              </Text>
              <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                Exige assinatura VIP para desbloquear o cupom/link
              </Text>
            </View>
            <Switch
              value={isVipEarly}
              trackColor={{ true: palette.goldDeep }}
              onValueChange={setIsVipEarly}
            />
          </View>

          <GradientButton
            size="lg"
            label="Publicar oferta"
            sf="checkmark"
            md="check"
            onPress={handleSaveManual}
          />
        </View>
      </ScrollView>
    </>
  );
}
