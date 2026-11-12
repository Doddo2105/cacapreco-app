import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton } from '@/components/gradient-button';
import { Icon } from '@/components/icon';
import { LogoMark } from '@/components/logo';
import { CSS_EASE_OUT, enterUp, reflow } from '@/components/motion';
import { TextField, type TextFieldRef } from '@/components/text-field';
import { useToast } from '@/components/toast';
import { APP_NAME, APP_TAGLINE } from '@/constants/brand';
import { useApp } from '@/context/app-store';
import { MIN_PASSWORD_LENGTH, useAuth } from '@/context/auth';
import { colors, gradientBg, gradients, palette } from '@/theme/colors';
import { haptics } from '@/utils/format';

type Mode = 'login' | 'signup' | 'forgot';

const HOME = '/(tabs)/(online)';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: 'Que bom te ver de novo',
    subtitle: 'Entre para continuar farejando ofertas.',
    cta: 'Entrar',
  },
  signup: {
    title: 'Crie sua conta grátis',
    subtitle: 'Leva menos de um minuto.',
    cta: 'Criar conta',
  },
  forgot: {
    title: 'Recuperar senha',
    subtitle: 'Enviamos um link para você criar uma nova senha.',
    cta: 'Enviar link',
  },
};

export default function LoginScreen() {
  useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { signIn, signUp, resetPassword, continueAsGuest, hasEntered, isOnline } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextFieldRef>(null);
  const passwordRef = useRef<TextFieldRef>(null);

  const switchMode = (next: Mode) => {
    haptics.tap();
    setMode(next);
    setError('');
    setNotice('');
  };

  const clearError = () => {
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setNotice('');
    setLoading(true);

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : mode === 'signup'
        ? await signUp(name, email, password)
        : await resetPassword(email);

    setLoading(false);

    if (!result.ok) {
      haptics.warning();
      setError(result.error);
      return;
    }

    haptics.success();

    if (mode === 'forgot') {
      setNotice(`Se houver uma conta com ${email.trim()}, o link chega em instantes.`);
      return;
    }

    if (result.needsEmailConfirmation) {
      setMode('login');
      setPassword('');
      setNotice('Conta criada! Confirme pelo link que enviamos ao seu e-mail e depois entre.');
      return;
    }

    router.replace(HOME as any);
    toast.show({
      title: mode === 'signup' ? `Bem-vindo ao ${APP_NAME}!` : 'Você entrou',
      message: mode === 'signup' ? 'Sua conta está pronta.' : undefined,
      sf: 'person.crop.circle.badge.checkmark',
      md: 'how-to-reg',
    });
  };

  const handleSkip = () => {
    haptics.tap();
    if (hasEntered) {
      router.back();
      return;
    }
    continueAsGuest();
    router.replace(HOME as any);
  };

  const copy = COPY[mode];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
    >
      {/* Brand hero */}
      <View
        style={[
          {
            paddingTop: insets.top + 36,
            paddingBottom: 64,
            paddingHorizontal: 24,
            alignItems: 'center',
            gap: 14,
          },
          gradientBg(gradients.moneyHero),
        ]}
      >
        <Animated.View entering={enterUp(0)}>
          <LogoMark size={84} />
        </Animated.View>
        <Animated.View entering={enterUp(1)} style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 38, fontWeight: '900', letterSpacing: -1, color: '#FFFFFF' }}>
            {APP_NAME}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: palette.mint, textAlign: 'center' }}>
            {APP_TAGLINE}
          </Text>
        </Animated.View>
      </View>

      {/* Form card overlaps the hero */}
      <Animated.View
        entering={enterUp(2)}
        style={{ marginTop: -36, paddingHorizontal: 16, gap: 16 }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 26,
            borderCurve: 'continuous',
            padding: 18,
            gap: 16,
            boxShadow: '0 12px 32px rgba(6, 78, 59, 0.14)',
          }}
        >
          {mode !== 'forgot' ? (
            <View
              accessibilityRole="tablist"
              style={{
                flexDirection: 'row',
                padding: 4,
                borderRadius: 15,
                borderCurve: 'continuous',
                backgroundColor: colors.fill,
              }}
            >
              <ModeTab label="Entrar" active={mode === 'login'} onPress={() => switchMode('login')} />
              <ModeTab
                label="Criar conta"
                active={mode === 'signup'}
                onPress={() => switchMode('signup')}
              />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => switchMode('login')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
            >
              <Icon sf="chevron.left" md="chevron-left" size={15} color={colors.tint} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.tint }}>
                Voltar para entrar
              </Text>
            </Pressable>
          )}

          <Animated.View key={mode} entering={FadeIn.duration(220)} style={{ gap: 3 }}>
            <Text style={{ fontSize: 23, fontWeight: '800', color: colors.label }}>{copy.title}</Text>
            <Text style={{ fontSize: 15, lineHeight: 20, color: colors.secondaryLabel }}>
              {copy.subtitle}
            </Text>
          </Animated.View>

          {notice ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{
                flexDirection: 'row',
                gap: 10,
                padding: 12,
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
              }}
            >
              <Icon sf="checkmark.circle.fill" md="check-circle" size={18} color={colors.tint} />
              <Text selectable style={{ flex: 1, fontSize: 14, lineHeight: 19, color: colors.label }}>
                {notice}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View layout={reflow} style={{ gap: 14 }}>
            {mode === 'signup' ? (
              <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
                <TextField
                  label="Nome"
                  sf="person.fill"
                  md="person"
                  placeholder="Como podemos te chamar?"
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    clearError();
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </Animated.View>
            ) : null}

            <TextField
              ref={emailRef}
              label="E-mail"
              sf="envelope.fill"
              md="mail"
              placeholder="voce@email.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError();
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType={mode === 'forgot' ? 'send' : 'next'}
              onSubmitEditing={() =>
                mode === 'forgot' ? handleSubmit() : passwordRef.current?.focus()
              }
            />

            {mode !== 'forgot' ? (
              <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(120)}>
                <TextField
                  ref={passwordRef}
                  label="Senha"
                  sf="lock.fill"
                  md="lock"
                  secure
                  placeholder={mode === 'signup' ? 'Crie uma senha' : 'Sua senha'}
                  hint={
                    mode === 'signup' ? `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres` : undefined
                  }
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    clearError();
                  }}
                  autoCapitalize="none"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                />
              </Animated.View>
            ) : null}
          </Animated.View>

          {error ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              accessibilityRole="alert"
              style={{
                flexDirection: 'row',
                gap: 10,
                padding: 12,
                borderRadius: 14,
                borderCurve: 'continuous',
                backgroundColor: 'rgba(220, 38, 38, 0.10)',
              }}
            >
              <Icon
                sf="exclamationmark.circle.fill"
                md="error"
                size={18}
                color={colors.danger}
              />
              <Text
                selectable
                style={{ flex: 1, fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.danger }}
              >
                {error}
              </Text>
            </Animated.View>
          ) : null}

          <Animated.View layout={reflow} style={{ gap: 14 }}>
            <GradientButton
              size="lg"
              loading={loading}
              label={loading ? 'Só um instante…' : copy.cta}
              sf={mode === 'forgot' ? 'paperplane.fill' : 'arrow.right'}
              md={mode === 'forgot' ? 'send' : 'arrow-forward'}
              onPress={handleSubmit}
            />

            {mode === 'login' ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => switchMode('forgot')}
                style={{ alignSelf: 'center', paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.tint }}>
                  Esqueci minha senha
                </Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleSkip}
          style={({ pressed }) => ({
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: 44,
            paddingHorizontal: 16,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.secondaryLabel }}>
            {hasEntered ? 'Agora não' : 'Continuar sem conta'}
          </Text>
          <Icon sf="arrow.right" md="arrow-forward" size={14} color={colors.secondaryLabel} />
        </Pressable>

        {!isOnline ? (
          <Text
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: colors.tertiaryLabel,
              textAlign: 'center',
              paddingHorizontal: 12,
            }}
          >
            Modo local: sua conta fica salva apenas neste aparelho.
          </Text>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{ flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderRadius: 12,
          backgroundColor: palette.emeraldDeep,
          opacity: active ? 1 : 0,
          transitionProperty: 'opacity',
          transitionDuration: '180ms',
          transitionTimingFunction: CSS_EASE_OUT,
        }}
      />
      <Text style={{ fontSize: 15, fontWeight: '800', color: active ? '#FFFFFF' : colors.secondaryLabel }}>
        {label}
      </Text>
    </Pressable>
  );
}
