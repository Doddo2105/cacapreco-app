import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  /** Visual style (colors, padding, radius) — applied to the pressable itself */
  style?: StyleProp<ViewStyle>;
  /** Layout of the animated wrapper inside its parent (flex, alignSelf, width) */
  containerStyle?: StyleProp<ViewStyle>;
  /** 0.97 for buttons; use 0.985 for large cards so the screen doesn't "squish" */
  scaleTo?: number;
}

/**
 * Press feedback for every button-like element: scales on press-in and
 * settles on press-out. A CSS transition on the UI thread — no shared values.
 * The animated wrapper carries only `transform`, so native semantic colors
 * in `style` never reach Reanimated.
 */
export function PressableScale({
  style,
  containerStyle,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [{ scale: pressed ? scaleTo : 1 }],
          transitionProperty: 'transform',
          transitionDuration: '120ms',
          transitionTimingFunction: EASE_OUT,
        },
      ]}
    >
      <Pressable
        pressRetentionOffset={16}
        {...rest}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
