import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AnimatedCurrency } from '@/components/animated-currency';
import { GradientButton } from '@/components/gradient-button';
import { Icon } from '@/components/icon';
import { LogoMark } from '@/components/logo';
import { enterUp, reflow } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { TextField } from '@/components/text-field';
import { useToast } from '@/components/toast';
import { APP_NAME, VIP_NAME } from '@/constants/brand';
import { useApp } from '@/context/app-store';
import { useAuth } from '@/context/auth';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import type { ThemeMode } from '@/types';
import { haptics } from '@/utils/format';

const THEME_OPTIONS = [
  { mode: 'light', label: 'Claro', sf: 'sun.max.fill', md: 'light-mode' },
  { mode: 'dark', label: 'Escuro', sf: 'moon.fill', md: 'dark-mode' },
  { mode: 'system', label: 'Sistema', sf: 'circle.lefthalf.filled', md: 'brightness-auto' },
] as const;

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

function memberSince(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export default function ProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, isOnline, updateName, signOut } = useAuth();
  const { settings, alerts, shoppingList, updateSettings } = useApp();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const basketSavings = shoppingList.reduce(
    (sum, item) =>
      sum +
      (item.bestDeal
        ? Math.max(0, item.bestDeal.originalPrice - item.bestDeal.dealPrice) * item.quantity
        : 0),
    0
  );

  const startEditing = () => {
    haptics.tap();
    setDraftName(user?.name ?? '');
    setNameError('');
    setEditing(true);
  };

  const handleSaveName = async () => {
    if (saving) return;
    setSaving(true);
    const result = await updateName(draftName);
    setSaving(false);
    if (!result.ok) {
      haptics.warning();
      setNameError(result.error);
      return;
    }
    haptics.success();
    setEditing(false);
    toast.show({ title: 'Nome atualizado', sf: 'person.fill.checkmark', md: 'how-to-reg' });
  };

  const handleSignOut = async () => {
    haptics.tap();
    await signOut();
    toast.show({ title: 'Você saiu da conta', sf: 'rectangle.portrait.and.arrow.right', md: 'logout' });
  };

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 13,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
    color: colors.label,
  };

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderCurve: 'continuous' as const,
    padding: 16,
    gap: 14,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
    >
      {/* Identity */}
      <Animated.View entering={enterUp(0)}>
        <View
          style={[
            {
              borderRadius: 26,
              borderCurve: 'continuous',
              padding: 18,
              gap: 16,
              boxShadow: shadows.money,
            },
            gradientBg(gradients.moneyHero),
          ]}
        >
          {user ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                accessibilityLabel={`Avatar de ${user.name}`}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: palette.lime,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                }}
              >
                <Text style={{ fontSize: 25, fontWeight: '900', color: palette.emeraldDark }}>
                  {initialsOf(user.name)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  selectable
                  numberOfLines={1}
                  style={{ fontSize: 23, fontWeight: '900', color: '#FFFFFF' }}
                >
                  {user.name}
                </Text>
                <Text
                  selectable
                  numberOfLines={1}
                  style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)' }}
                >
                  {user.email}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <View
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      },
                      settings.isVip ? gradientBg(gradients.gold) : null,
                    ]}
                  >
                    <Icon
                      sf={settings.isVip ? 'bolt.fill' : 'person.fill'}
                      md={settings.isVip ? 'bolt' : 'person'}
                      size={12}
                      color={settings.isVip ? '#1F1300' : '#FFFFFF'}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '800',
                        color: settings.isVip ? '#1F1300' : '#FFFFFF',
                      }}
                    >
                      {settings.isVip ? 'VIP' : 'Plano gratuito'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <LogoMark size={60} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontSize: 21, fontWeight: '900', color: '#FFFFFF' }}>
                    Você está sem conta
                  </Text>
                  <Text style={{ fontSize: 14, lineHeight: 19, color: 'rgba(255, 255, 255, 0.85)' }}>
                    Crie a sua em menos de um minuto para ter seu perfil no {APP_NAME}.
                  </Text>
                </View>
              </View>
              <PressableScale
                accessibilityRole="button"
                onPress={() => {
                  haptics.tap();
                  router.push('/login' as any);
                }}
                style={{
                  minHeight: 50,
                  borderRadius: 15,
                  borderCurve: 'continuous',
                  backgroundColor: palette.lime,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Icon
                  sf="person.crop.circle.badge.plus"
                  md="person-add"
                  size={18}
                  color={palette.emeraldDark}
                />
                <Text style={{ fontSize: 16, fontWeight: '800', color: palette.emeraldDark }}>
                  Entrar ou criar conta
                </Text>
              </PressableScale>
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StatTile label="Economia na cesta">
              <AnimatedCurrency
                value={basketSavings}
                style={{ fontSize: 17, fontWeight: '900', color: palette.lime }}
              />
            </StatTile>
            <StatTile label="Alertas ativos">
              <Text style={statNumberStyle}>{alerts.length}</Text>
            </StatTile>
            <StatTile label="Itens na cesta">
              <Text style={statNumberStyle}>{shoppingList.length}</Text>
            </StatTile>
          </View>
        </View>
      </Animated.View>

      {/* Account details */}
      {user ? (
        <Animated.View entering={enterUp(1)} layout={reflow}>
          <View style={cardStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: colors.label }}>
                Minha conta
              </Text>
              {!editing ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Editar nome"
                  hitSlop={10}
                  onPress={startEditing}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                >
                  <Icon sf="pencil" md="edit" size={15} color={colors.tint} />
                  <Text style={{ fontSize: 15, fontWeight: '700', color: colors.tint }}>Editar</Text>
                </Pressable>
              ) : null}
            </View>

            {editing ? (
              <Animated.View entering={FadeIn.duration(200)} style={{ gap: 12 }}>
                <TextField
                  label="Nome"
                  sf="person.fill"
                  md="person"
                  value={draftName}
                  onChangeText={(t) => {
                    setDraftName(t);
                    if (nameError) setNameError('');
                  }}
                  error={nameError}
                  autoFocus
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleSaveName}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <PressableScale
                    accessibilityRole="button"
                    containerStyle={{ flex: 1 }}
                    onPress={() => setEditing(false)}
                    style={{
                      minHeight: 44,
                      borderRadius: 13,
                      borderCurve: 'continuous',
                      backgroundColor: colors.fill,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.label }}>
                      Cancelar
                    </Text>
                  </PressableScale>
                  <GradientButton
                    containerStyle={{ flex: 1 }}
                    loading={saving}
                    label="Salvar"
                    sf="checkmark"
                    md="check"
                    onPress={handleSaveName}
                  />
                </View>
              </Animated.View>
            ) : (
              <View style={{ gap: 12 }}>
                <InfoRow sf="person.fill" md="person" label="Nome" value={user.name} />
                <InfoRow sf="envelope.fill" md="mail" label="E-mail" value={user.email} />
                {memberSince(user.createdAt) ? (
                  <InfoRow
                    sf="calendar"
                    md="event"
                    label="Membro desde"
                    value={memberSince(user.createdAt)}
                  />
                ) : null}
                {!isOnline ? (
                  <Text style={{ fontSize: 13, lineHeight: 18, color: colors.tertiaryLabel }}>
                    Modo local: esta conta está salva apenas neste aparelho.
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        </Animated.View>
      ) : null}

      {/* VIP */}
      <Animated.View entering={enterUp(2)} layout={reflow}>
        {settings.isVip ? (
          <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View
              style={[
                {
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                gradientBg(gradients.gold),
              ]}
            >
              <Icon sf="checkmark.seal.fill" md="verified" size={23} color="#1F1300" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.label }}>
                {VIP_NAME} ativo
              </Text>
              <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                {settings.vipPlan === 'mensal' ? 'Plano mensal' : 'Passaporte anual'} · Bugs de
                Preço e alertas ilimitados
              </Text>
            </View>
          </View>
        ) : (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Conhecer o ${VIP_NAME}`}
            onPress={() => {
              haptics.tap();
              router.push('/paywall' as any);
            }}
            style={[
              {
                borderRadius: 22,
                borderCurve: 'continuous',
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              },
              gradientBg(gradients.vipHero),
            ]}
          >
            <View
              style={[
                {
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  borderCurve: 'continuous',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                gradientBg(gradients.gold),
              ]}
            >
              <Icon sf="bolt.fill" md="bolt" size={23} color="#1F1300" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>
                Seja {VIP_NAME}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 17, color: 'rgba(255, 255, 255, 0.8)' }}>
                Alertas ilimitados e Bugs de Preço antes de todo mundo
              </Text>
            </View>
            <Icon sf="chevron.right" md="chevron-right" size={16} color={palette.gold} />
          </PressableScale>
        )}
      </Animated.View>

      {/* Appearance */}
      <Animated.View entering={enterUp(3)} layout={reflow}>
        <View style={cardStyle}>
          <View style={{ gap: 2 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>Aparência</Text>
            <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
              Claro, escuro ou igual ao sistema
            </Text>
          </View>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: 8 }}>
            {THEME_OPTIONS.map((opt) => {
              const active = (settings.themeMode ?? 'system') === opt.mode;
              return (
                <PressableScale
                  key={opt.mode}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Tema ${opt.label}`}
                  containerStyle={{ flex: 1 }}
                  onPress={() => {
                    haptics.tap();
                    updateSettings({ themeMode: opt.mode as ThemeMode });
                  }}
                  style={[
                    {
                      minHeight: 58,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      padding: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      backgroundColor: colors.fill,
                    },
                    active ? gradientBg(gradients.money) : null,
                  ]}
                >
                  <Icon
                    sf={opt.sf}
                    md={opt.md}
                    size={18}
                    color={active ? '#FFFFFF' : colors.secondaryLabel}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : colors.label,
                    }}
                  >
                    {opt.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      </Animated.View>

      {/* Region, affiliates and VIP switch */}
      <Animated.View entering={enterUp(4)} layout={reflow}>
        <View style={cardStyle}>
          <View style={{ gap: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
              Cidade e afiliados
            </Text>
            <Text style={{ fontSize: 13, lineHeight: 18, color: colors.secondaryLabel }}>
              Cada toque em “Pegar oferta” já sai com a sua tag de afiliado.
            </Text>
          </View>

          <SettingField
            label="Cidade dos supermercados"
            value={settings.city}
            onChangeText={(city) => updateSettings({ city })}
            inputStyle={inputStyle}
            autoCapitalize="words"
          />
          <SettingField
            label="Tag Associados Amazon (ex: seuapp-20)"
            value={settings.amazonTag}
            onChangeText={(amazonTag) => updateSettings({ amazonTag })}
            inputStyle={inputStyle}
          />
          <SettingField
            label="ID de afiliado Mercado Livre"
            value={settings.mercadoLivreTag}
            onChangeText={(mercadoLivreTag) => updateSettings({ mercadoLivreTag })}
            inputStyle={inputStyle}
          />
          <SettingField
            label="ID de afiliado Shopee"
            value={settings.shopeeTag}
            onChangeText={(shopeeTag) => updateSettings({ shopeeTag })}
            inputStyle={inputStyle}
          />

          <View
            style={{
              paddingTop: 14,
              borderTopWidth: 0.5,
              borderTopColor: colors.separator,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
                Assinatura {VIP_NAME}
              </Text>
              <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>
                Bugs de Preço e alertas ilimitados
              </Text>
            </View>
            <Switch
              value={settings.isVip}
              trackColor={{ true: palette.emerald }}
              onValueChange={(isVip) => updateSettings({ isVip, vipPlan: isVip ? 'anual' : null })}
            />
          </View>
        </View>
      </Animated.View>

      {/* Sign out */}
      {user ? (
        <Animated.View layout={reflow}>
          <PressableScale
            accessibilityRole="button"
            onPress={handleSignOut}
            style={{
              minHeight: 52,
              borderRadius: 16,
              borderCurve: 'continuous',
              backgroundColor: colors.card,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon
              sf="rectangle.portrait.and.arrow.right"
              md="logout"
              size={18}
              color={colors.danger}
            />
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.danger }}>
              Sair da conta
            </Text>
          </PressableScale>
        </Animated.View>
      ) : null}

      <Text style={{ fontSize: 13, color: colors.tertiaryLabel, textAlign: 'center' }}>
        {APP_NAME} · versão {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}

const statNumberStyle = {
  fontSize: 17,
  fontWeight: '900' as const,
  color: '#FFFFFF',
  fontVariant: ['tabular-nums' as const],
};

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        gap: 2,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 14,
        borderCurve: 'continuous',
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
      }}
    >
      {children}
      <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)' }}>
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  sf,
  md,
  label,
  value,
}: {
  sf: string;
  md: string;
  label: string;
  value: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          borderCurve: 'continuous',
          backgroundColor: 'rgba(16, 185, 129, 0.14)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sf={sf} md={md} size={18} color={colors.tint} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>{label}</Text>
        <Text selectable numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: colors.label }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SettingField({
  label,
  value,
  onChangeText,
  inputStyle,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  inputStyle: object;
  autoCapitalize?: 'none' | 'words';
}) {
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.secondaryLabel }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={inputStyle}
      />
    </View>
  );
}
