import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Icon } from '@/components/icon';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';
import { formatCurrency, haptics, parseNumber } from '@/utils/format';

export default function ShoppingListScreen() {
  useColorScheme();
  const router = useRouter();
  const {
    shoppingList,
    storeRankings,
    addShoppingItem,
    toggleShoppingItem,
    changeShoppingQty,
    removeShoppingItem,
  } = useApp();

  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');

  const handleAdd = () => {
    if (!itemName.trim()) return;
    haptics.tap();
    addShoppingItem(itemName, Math.max(1, parseNumber(itemQty) || 1));
    setItemName('');
    setItemQty('1');
  };

  const optimalTotal = shoppingList.reduce(
    (sum, item) => sum + (item.bestDeal ? item.bestDeal.dealPrice * item.quantity : 0),
    0
  );

  const optimalSavings = shoppingList.reduce(
    (sum, item) =>
      sum +
      (item.bestDeal
        ? Math.max(0, item.bestDeal.originalPrice - item.bestDeal.dealPrice) * item.quantity
        : 0),
    0
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 40,
        gap: 16,
      }}
    >
      {/* Optimal Multi-Store Summary */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon sf="sparkles" md="auto-awesome" size={16} color={colors.success} />
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.success }}>
            CESTA OTIMIZADA (MENOR PREÇO POR ITEM)
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View>
            <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
              Total estimado da lista
            </Text>
            <Text
              selectable
              style={{
                fontSize: 26,
                fontWeight: '800',
                color: colors.label,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatCurrency(optimalTotal)}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: colors.secondaryLabel }}>Economia total</Text>
            <Text
              selectable
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: colors.success,
                fontVariant: ['tabular-nums'],
              }}
            >
              - {formatCurrency(optimalSavings)}
            </Text>
          </View>
        </View>
      </View>

      {/* Supermarket Ranking Comparison */}
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
          Comparativo por Supermercado
        </Text>

        {storeRankings.map((rank, index) => {
          const store = getStoreMeta(rank.storeName);
          const isWinner = index === 0;
          return (
            <View
              key={rank.storeName}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 12,
                borderRadius: 12,
                borderCurve: 'continuous',
                backgroundColor: colors.fill,
                borderWidth: isWinner ? 1.5 : 0,
                borderColor: isWinner ? colors.success : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    backgroundColor: store.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sf={store.sf} md={store.md} size={17} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                    {index + 1}º {rank.storeName} {isWinner ? '· Mais Barato' : ''}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.secondaryLabel,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    Economia de {formatCurrency(rank.totalSavings)}
                  </Text>
                </View>
              </View>

              <Text
                selectable
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: isWinner ? colors.success : colors.label,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatCurrency(rank.totalPrice)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Add Item Form */}
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
          Adicionar item na lista de compras
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            placeholder="Ex: Leite, Azeite, Fralda, Café..."
            placeholderTextColor={colors.secondaryLabel as string}
            value={itemName}
            onChangeText={setItemName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            style={{
              flex: 1,
              backgroundColor: colors.fill,
              borderRadius: 12,
              borderCurve: 'continuous',
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.label,
            }}
          />
          <TextInput
            placeholder="Qtd"
            placeholderTextColor={colors.secondaryLabel as string}
            keyboardType="numeric"
            value={itemQty}
            onChangeText={setItemQty}
            style={{
              width: 64,
              backgroundColor: colors.fill,
              borderRadius: 12,
              borderCurve: 'continuous',
              paddingHorizontal: 12,
              paddingVertical: 11,
              fontSize: 15,
              color: colors.label,
              textAlign: 'center',
            }}
          />
          <Pressable
            onPress={handleAdd}
            style={{
              backgroundColor: colors.tint,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderCurve: 'continuous',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sf="plus" md="add" size={20} color={colors.onTint} />
          </Pressable>
        </View>
      </View>

      {/* Shopping Items with Matched Cheapest Deal */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          borderCurve: 'continuous',
          padding: 16,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: colors.label,
            fontVariant: ['tabular-nums'],
          }}
        >
          Itens da Lista ({shoppingList.length})
        </Text>

        {shoppingList.map((item) => (
          <View
            key={item.id}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: colors.separator,
              gap: 6,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <Pressable
                onPress={() => {
                  haptics.tap();
                  toggleShoppingItem(item.id);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <Icon
                  sf={item.checked ? 'checkmark.circle.fill' : 'circle'}
                  md={item.checked ? 'check-circle' : 'radio-button-unchecked'}
                  size={22}
                  color={item.checked ? colors.success : colors.secondaryLabel}
                />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: item.checked ? colors.secondaryLabel : colors.label,
                    textDecorationLine: item.checked ? 'line-through' : 'none',
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Pressable
                  onPress={() => {
                    haptics.tap();
                    changeShoppingQty(item.id, -1);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: colors.fill,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sf="minus" md="remove" size={14} color={colors.label} />
                </Pressable>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.label,
                    minWidth: 20,
                    textAlign: 'center',
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {item.quantity}
                </Text>
                <Pressable
                  onPress={() => {
                    haptics.tap();
                    changeShoppingQty(item.id, 1);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: colors.fill,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sf="plus" md="add" size={14} color={colors.label} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    haptics.tap();
                    removeShoppingItem(item.id);
                  }}
                  style={{ padding: 4 }}
                >
                  <Icon sf="trash" md="delete" size={17} color={colors.danger} />
                </Pressable>
              </View>
            </View>

            {item.bestDeal ? (
              <Pressable
                onPress={() => router.push(`/deal/${item.bestDeal!.id}` as any)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.fill,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  borderCurve: 'continuous',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ flex: 1, fontSize: 12, color: colors.secondaryLabel }}
                >
                  Mais barato em{' '}
                  <Text style={{ fontWeight: '700', color: colors.label }}>
                    {item.bestDeal.storeName}
                  </Text>{' '}
                  ({formatCurrency(item.bestDeal.dealPrice)}/{item.bestDeal.unit})
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: colors.success,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(item.bestDeal.dealPrice * item.quantity)}
                </Text>
              </Pressable>
            ) : (
              <Text style={{ fontSize: 12, color: colors.secondaryLabel, paddingLeft: 32 }}>
                Sem oferta cadastrada para este item ainda
              </Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
