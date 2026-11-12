import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { AnimatedCurrency } from '@/components/animated-currency';
import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { Appear, enterUp, ProgressBar, reflow } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { getStoreMeta } from '@/constants/stores';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
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

  const checkedCount = shoppingList.filter((i) => i.checked).length;
  const allChecked = shoppingList.length > 0 && checkedCount === shoppingList.length;
  const maxRankPrice = Math.max(1, ...storeRankings.map((r) => r.totalPrice));

  const handleToggle = (id: string, wasChecked: boolean) => {
    const completes = !wasChecked && checkedCount + 1 === shoppingList.length;
    if (completes) haptics.success();
    else haptics.tap();
    toggleShoppingItem(id);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Optimized basket hero */}
      <Animated.View entering={enterUp(0)}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon sf="sparkles" md="auto-awesome" size={15} color={palette.lime} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: palette.mint }}>
              CESTA OTIMIZADA · MENOR PREÇO POR ITEM
            </Text>
          </View>

          <View
            style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}
          >
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)' }}>
                Total estimado
              </Text>
              <AnimatedCurrency
                value={optimalTotal}
                style={{ fontSize: 36, fontWeight: '900', letterSpacing: -1, color: '#FFFFFF' }}
              />
            </View>

            <View
              style={{
                alignItems: 'flex-end',
                gap: 1,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: palette.lime,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: palette.emeraldDark }}>
                VOCÊ ECONOMIZA
              </Text>
              <AnimatedCurrency
                value={optimalSavings}
                style={{ fontSize: 18, fontWeight: '900', color: palette.emeraldDark }}
              />
            </View>
          </View>

          {shoppingList.length > 0 ? (
            <View style={{ gap: 7 }}>
              <ProgressBar
                progress={checkedCount / shoppingList.length}
                gradient={`linear-gradient(90deg, ${palette.mint} 0%, ${palette.lime} 100%)`}
                trackColor="rgba(255, 255, 255, 0.2)"
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {allChecked
                  ? 'Compra completa — tudo no carrinho!'
                  : `${checkedCount} de ${shoppingList.length} itens no carrinho`}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Add item */}
      <Animated.View entering={enterUp(1)}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.card,
            borderRadius: 20,
            borderCurve: 'continuous',
            padding: 8,
            boxShadow: shadows.card,
          }}
        >
          <TextInput
            accessibilityLabel="Nome do item"
            placeholder="Adicionar item: leite, café, fralda…"
            placeholderTextColor={colors.secondaryLabel as string}
            value={itemName}
            onChangeText={setItemName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 46,
              paddingHorizontal: 12,
              fontSize: 16,
              color: colors.label,
            }}
          />
          <TextInput
            accessibilityLabel="Quantidade"
            placeholder="Qtd"
            placeholderTextColor={colors.secondaryLabel as string}
            keyboardType="numeric"
            value={itemQty}
            onChangeText={setItemQty}
            selectTextOnFocus
            style={{
              width: 54,
              minHeight: 46,
              backgroundColor: colors.fill,
              borderRadius: 13,
              borderCurve: 'continuous',
              fontSize: 16,
              fontWeight: '700',
              color: colors.label,
              textAlign: 'center',
              fontVariant: ['tabular-nums'],
            }}
          />
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Adicionar item à lista"
            onPress={handleAdd}
            style={[
              {
                width: 46,
                height: 46,
                borderRadius: 14,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: itemName.trim() ? 1 : 0.45,
              },
              gradientBg(gradients.money),
            ]}
          >
            <Icon sf="plus" md="add" size={22} color="#FFFFFF" weight="bold" />
          </PressableScale>
        </View>
      </Animated.View>

      {/* Items */}
      <Animated.View layout={reflow} style={{ gap: 10 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: colors.secondaryLabel,
            fontVariant: ['tabular-nums'],
          }}
        >
          {shoppingList.length} {shoppingList.length === 1 ? 'ITEM' : 'ITENS'} NA LISTA
        </Text>

        {shoppingList.length === 0 ? (
          <EmptyState
            sf="cart"
            md="shopping-cart"
            title="Sua cesta está vazia"
            message="Adicione o que você precisa comprar e mostramos onde cada item está mais barato."
          />
        ) : null}

        {shoppingList.map((item, index) => (
          <Appear key={item.id} index={index + 2}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 18,
                borderCurve: 'continuous',
                padding: 12,
                gap: 10,
                opacity: item.checked ? 0.72 : 1,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.checked }}
                  accessibilityLabel={item.name}
                  hitSlop={8}
                  onPress={() => handleToggle(item.id, item.checked)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: item.checked ? 0 : 2,
                      borderColor: colors.tertiaryLabel,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.checked ? (
                      <Animated.View
                        entering={ZoomIn.duration(200)}
                        style={[
                          {
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          gradientBg(gradients.money),
                        ]}
                      >
                        <Icon sf="checkmark" md="check" size={15} color="#FFFFFF" weight="bold" />
                      </Animated.View>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={2}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      fontWeight: '700',
                      color: item.checked ? colors.secondaryLabel : colors.label,
                      textDecorationLine: item.checked ? 'line-through' : 'none',
                    }}
                  >
                    {item.name}
                  </Text>
                </Pressable>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.fill,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                  }}
                >
                  <StepButton
                    label={`Diminuir ${item.name}`}
                    sf="minus"
                    md="remove"
                    onPress={() => changeShoppingQty(item.id, -1)}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: colors.label,
                      minWidth: 22,
                      textAlign: 'center',
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {item.quantity}
                  </Text>
                  <StepButton
                    label={`Aumentar ${item.name}`}
                    sf="plus"
                    md="add"
                    onPress={() => changeShoppingQty(item.id, 1)}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.name}`}
                  hitSlop={10}
                  onPress={() => {
                    haptics.tap();
                    removeShoppingItem(item.id);
                  }}
                  style={{ padding: 6 }}
                >
                  <Icon sf="trash" md="delete-outline" size={19} color={colors.danger} />
                </Pressable>
              </View>

              {item.bestDeal ? (
                <PressableScale
                  accessibilityRole="button"
                  onPress={() => router.push(`/deal/${item.bestDeal!.id}` as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'rgba(16, 185, 129, 0.10)',
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                  }}
                >
                  <Icon sf="tag.fill" md="local-offer" size={14} color={colors.tint} />
                  <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, color: colors.secondaryLabel }}>
                    Mais barato em{' '}
                    <Text style={{ fontWeight: '800', color: colors.label }}>
                      {item.bestDeal.storeName}
                    </Text>{' '}
                    · {formatCurrency(item.bestDeal.dealPrice)}/{item.bestDeal.unit}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: colors.success,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatCurrency(item.bestDeal.dealPrice * item.quantity)}
                  </Text>
                  <Icon sf="chevron.right" md="chevron-right" size={12} color={colors.tertiaryLabel} />
                </PressableScale>
              ) : (
                <Text style={{ fontSize: 13, color: colors.secondaryLabel, paddingLeft: 38 }}>
                  Ainda sem oferta para este item
                </Text>
              )}
            </View>
          </Appear>
        ))}
      </Animated.View>

      {/* Supermarket ranking */}
      {storeRankings.length > 0 ? (
        <Animated.View layout={reflow} entering={enterUp(4)}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 22,
              borderCurve: 'continuous',
              padding: 16,
              gap: 14,
              boxShadow: shadows.card,
            }}
          >
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                Onde sua cesta sai mais barata
              </Text>
              <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                Comprando tudo em um único mercado
              </Text>
            </View>

            {storeRankings.map((rank, index) => {
              const store = getStoreMeta(rank.storeName);
              const isWinner = index === 0;
              return (
                <View key={rank.storeName} style={{ gap: 7 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        borderCurve: 'continuous',
                        backgroundColor: store.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sf={store.sf} md={store.md} size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 15, fontWeight: '700', color: colors.label, flexShrink: 1 }}
                        >
                          {index + 1}º {rank.storeName}
                        </Text>
                        {isWinner ? (
                          <View
                            style={[
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 3,
                                paddingHorizontal: 7,
                                paddingVertical: 3,
                                borderRadius: 999,
                              },
                              gradientBg(gradients.gold),
                            ]}
                          >
                            <Icon sf="trophy.fill" md="emoji-events" size={11} color={colors.onBrand} />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onBrand }}>
                              Mais barato
                            </Text>
                          </View>
                        ) : null}
                      </View>
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
                    <Text
                      selectable
                      style={{
                        fontSize: 17,
                        fontWeight: '800',
                        color: isWinner ? colors.success : colors.label,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {formatCurrency(rank.totalPrice)}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={rank.totalPrice / maxRankPrice}
                    gradient={
                      isWinner
                        ? gradients.money
                        : 'linear-gradient(90deg, rgba(120, 120, 128, 0.45) 0%, rgba(120, 120, 128, 0.45) 100%)'
                    }
                  />
                </View>
              );
            })}
          </View>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

function StepButton({
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.4 : 1,
      })}
    >
      <Icon sf={sf} md={md} size={15} color={colors.label} />
    </Pressable>
  );
}
