import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { enterUp } from '@/components/motion';
import { PressableScale } from '@/components/pressable-scale';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedTabs } from '@/components/segmented-tabs';
import { useApp } from '@/context/app-store';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import type { ThemeMode } from '@/types';
import { haptics } from '@/utils/format';

type SettingsSubTab = 'geral' | 'afiliados';

export default function SettingsScreen() {
  useColorScheme();
  const router = useRouter();
  const { settings, updateSettings } = useApp();
  const [subTab, setSubTab] = useState<SettingsSubTab>('geral');

  const inputStyle = {
    backgroundColor: colors.fill,
    borderRadius: 13,
    borderCurve: 'continuous' as const,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
    color: colors.label,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 48, gap: 20 }}
    >
      <ScreenHeader
        eyebrow="Preferências & Comissões"
        eyebrowSf="gearshape.fill"
        eyebrowMd="settings"
        title="Ajustes &"
        accent="Afiliados"
        subtitle={`${settings.city} · ${settings.isVip ? 'Assinante VIP ativo' : 'Plano Gratuito'}`}
        actionLabel={settings.isVip ? 'VIP Ativo' : 'Seja VIP'}
        actionSf="bolt.fill"
        actionMd="bolt"
        actionTone="gold"
        onActionPress={() => router.push('/paywall' as any)}
      />

      <View style={{ paddingHorizontal: 16, gap: 20 }}>
      {/* Internal sub-tabs: Aparência & VIP vs Cidade & Afiliados */}
      <SegmentedTabs<SettingsSubTab>
        value={subTab}
        onChange={setSubTab}
        options={[
          {
            key: 'geral',
            label: 'Tema & VIP',
            sf: 'paintbrush.fill',
            md: 'palette',
          },
          {
            key: 'afiliados',
            label: 'Cidade & Afiliados',
            sf: 'link',
            md: 'link',
          },
        ]}
      />

      {subTab === 'geral' ? (
        <Animated.View entering={enterUp(0)} style={{ gap: 20 }}>
          {/* Theme selector card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              borderCurve: 'continuous',
              padding: 20,
              gap: 16,
              boxShadow: shadows.card,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                Tema do aplicativo
              </Text>
              <Text style={{ fontSize: 14, color: colors.secondaryLabel }}>
                Escolha entre claro, escuro ou igual ao sistema
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(
                [
                  { mode: 'light', label: 'Claro', sf: 'sun.max.fill', md: 'light-mode' },
                  { mode: 'dark', label: 'Escuro', sf: 'moon.fill', md: 'dark-mode' },
                  {
                    mode: 'system',
                    label: 'Igual ao sistema',
                    sf: 'circle.lefthalf.filled',
                    md: 'brightness-auto',
                  },
                ] as const
              ).map((opt) => {
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
                        minHeight: 54,
                        borderRadius: 15,
                        borderCurve: 'continuous',
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: active ? palette.emeraldDeep : colors.fill,
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
                        fontSize: 12,
                        fontWeight: '800',
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

          {/* VIP card */}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                  Assinatura CaçaPreço VIP
                </Text>
                <Text style={{ fontSize: 14, color: colors.secondaryLabel }}>
                  Bugs de Preço e alertas ilimitados
                </Text>
              </View>
              <Switch
                value={settings.isVip}
                trackColor={{ true: palette.emerald }}
                onValueChange={(isVip) =>
                  updateSettings({ isVip, vipPlan: isVip ? 'anual' : null })
                }
              />
            </View>
          </View>

          {!settings.isVip ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Conhecer o CaçaPreço VIP"
              onPress={() => {
                haptics.tap();
                router.push('/paywall' as any);
              }}
              style={[
                {
                  borderRadius: 24,
                  borderCurve: 'continuous',
                  padding: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                },
                gradientBg(gradients.vipHero),
              ]}
            >
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
                <Icon sf="bolt.fill" md="bolt" size={24} color={colors.onBrand} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#FFFFFF' }}>
                  Ver benefícios do plano VIP
                </Text>
                <Text style={{ fontSize: 13, lineHeight: 18, color: 'rgba(255, 255, 255, 0.8)' }}>
                  7 dias grátis · Cancele quando quiser
                </Text>
              </View>
              <Icon sf="chevron.right" md="chevron-right" size={16} color={palette.gold} />
            </PressableScale>
          ) : null}
        </Animated.View>
      ) : (
        <Animated.View entering={enterUp(0)}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              borderCurve: 'continuous',
              padding: 20,
              gap: 16,
              boxShadow: shadows.card,
            }}
          >
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.label }}>
                Cidade e afiliados
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.secondaryLabel }}>
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
          </View>
        </Animated.View>
      )}
      </View>
    </ScrollView>
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
    <View style={{ gap: 6 }}>
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
