import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/icon';
import { EASE_OUT } from '@/components/motion';
import { gradientBg, gradients, palette } from '@/theme/colors';

type ToastTone = 'money' | 'hot' | 'gold';

interface ToastOptions {
  title: string;
  message?: string;
  tone?: ToastTone;
  sf?: string;
  md?: string;
}

interface ToastState extends ToastOptions {
  key: number;
}

const ToastContext = createContext<{ show: (options: ToastOptions) => void } | null>(null);

const TONE_GRADIENT: Record<ToastTone, string> = {
  money: gradients.money,
  hot: gradients.hot,
  gold: gradients.gold,
};

/**
 * Non-blocking confirmation that replaces `Alert.alert` for success moments:
 * the user keeps browsing deals instead of dismissing a dialog.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((options: ToastOptions) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ ...options, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const value = useMemo(() => ({ show }), [show]);
  const tone = toast?.tone ?? 'money';

  return (
    <ToastContext value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          alignItems: 'center',
        }}
      >
        {toast ? (
          <Animated.View
            key={toast.key}
            entering={FadeInUp.duration(280).easing(EASE_OUT)}
            exiting={FadeOutUp.duration(180)}
            style={{ maxWidth: 480, width: '100%' }}
          >
            <Pressable
              accessibilityRole="alert"
              onPress={() => setToast(null)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                paddingRight: 16,
                borderRadius: 18,
                borderCurve: 'continuous',
                backgroundColor: palette.night,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
              }}
            >
              <View
                style={[
                  {
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    borderCurve: 'continuous',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  gradientBg(TONE_GRADIENT[tone]),
                ]}
              >
                <Icon
                  sf={toast.sf ?? 'checkmark'}
                  md={toast.md ?? 'check'}
                  size={19}
                  color={tone === 'gold' ? '#1F1300' : '#FFFFFF'}
                  weight="bold"
                />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
                  {toast.title}
                </Text>
                {toast.message ? (
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.78)', lineHeight: 17 }}
                  >
                    {toast.message}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext>
  );
}

export function useToast() {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
