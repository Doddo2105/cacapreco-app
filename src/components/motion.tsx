import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cubicBezier,
  Easing,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';
import { gradientBg } from '@/theme/colors';

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
const CSS_EASE_IN_OUT = cubicBezier(0.77, 0, 0.175, 1);

/** Staggered entrance for the first items of a list; later items appear together. */
export function enterUp(index = 0) {
  return FadeInDown.duration(380)
    .delay(Math.min(index, 6) * 55)
    .easing(EASE_OUT);
}

export const exitFade = FadeOut.duration(150);
export const reflow = LinearTransition.duration(260).easing(EASE_OUT);

/** List row / card that enters staggered, fades out, and reflows when siblings change. */
export function Appear({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Animated.View entering={enterUp(index)} exiting={exitFade} layout={reflow} style={style}>
      {children}
    </Animated.View>
  );
}

const pulseKeyframes = {
  from: { transform: [{ scale: 1 }] },
  to: { transform: [{ scale: 1.16 }] },
};

/**
 * Gentle breathing loop that draws the eye to ONE thing per screen
 * (a very hot deal, a live indicator). Disabled under reduced motion.
 */
export function Pulse({
  children,
  active = true,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  if (!active || reduced) return <Animated.View style={style}>{children}</Animated.View>;
  return (
    <Animated.View
      style={[
        style,
        {
          animationName: pulseKeyframes,
          animationDuration: '900ms',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationTimingFunction: CSS_EASE_IN_OUT,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const blinkKeyframes = {
  from: { opacity: 1 },
  to: { opacity: 0.25 },
};

/** Blinking "live" dot. */
export function LiveDot({ color, size = 8 }: { color: string; size?: number }) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        reduced
          ? null
          : {
              animationName: blinkKeyframes,
              animationDuration: '1000ms',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: CSS_EASE_IN_OUT,
            },
      ]}
    />
  );
}

/**
 * Progress / meter bar. The fill is absolutely positioned and childless,
 * so animating its width costs no layout for siblings and keeps the radius.
 */
export function ProgressBar({
  progress,
  gradient,
  trackColor = 'rgba(120, 120, 128, 0.16)',
  height = 8,
}: {
  progress: number;
  gradient: string;
  trackColor?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            borderRadius: height / 2,
            transitionProperty: 'width',
            transitionDuration: '500ms',
            transitionTimingFunction: CSS_EASE_OUT,
          },
          gradientBg(gradient),
        ]}
      />
    </Animated.View>
  );
}
