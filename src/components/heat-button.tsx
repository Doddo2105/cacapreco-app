import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { EASE_OUT, Pulse } from '@/components/motion';
import { gradientBg, gradients, palette } from '@/theme/colors';
import { haptics } from '@/utils/format';

/** Deals above this temperature are "pegando fogo" and get the filled treatment. */
export const HOT_THRESHOLD = 400;

interface HeatButtonProps {
  temperature: number;
  delta: number;
  onVote: () => void;
  size?: 'sm' | 'lg';
}

/**
 * Community temperature vote. Tapping pops the pill and floats a "+N°"
 * so the vote visibly lands — the app's signature micro-interaction.
 */
export function HeatButton({ temperature, delta, onVote, size = 'sm' }: HeatButtonProps) {
  const reduced = useReducedMotion();
  const pop = useSharedValue(1);
  const rise = useSharedValue(1);

  const isHot = temperature >= HOT_THRESHOLD;
  const lg = size === 'lg';

  const pillStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.get() }] }));
  const floatStyle = useAnimatedStyle(() => {
    const t = rise.get();
    return {
      opacity: t >= 1 ? 0 : 1 - t,
      transform: [{ translateY: -4 - t * 22 }],
    };
  });

  const handlePress = () => {
    haptics.tap();
    onVote();
    if (reduced) return;
    pop.set(
      withSequence(
        withTiming(1.18, { duration: 90, easing: EASE_OUT }),
        withSpring(1, { duration: 400, dampingRatio: 0.6 })
      )
    );
    rise.set(0);
    rise.set(withTiming(1, { duration: 650, easing: EASE_OUT }));
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Temperatura ${temperature} graus. Toque para esquentar a oferta`}
      hitSlop={10}
      onPress={(e) => {
        // Inside a card that is a link: keep the tap here (web would follow the href).
        e.stopPropagation();
        e.preventDefault();
        handlePress();
      }}
    >
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: lg ? 6 : 4,
            paddingHorizontal: lg ? 14 : 10,
            paddingVertical: lg ? 9 : 5,
            borderRadius: 999,
            backgroundColor: 'rgba(255, 90, 31, 0.12)',
          },
          isHot ? gradientBg(gradients.hot) : null,
          pillStyle,
        ]}
      >
        <Pulse active={isHot}>
          <Icon
            sf="flame.fill"
            md="local-fire-department"
            size={lg ? 18 : 14}
            color={isHot ? '#FFFFFF' : palette.hot}
          />
        </Pulse>
        <Text
          style={{
            fontSize: lg ? 16 : 13,
            fontWeight: '800',
            color: isHot ? '#FFFFFF' : palette.hot,
            fontVariant: ['tabular-nums'],
          }}
        >
          {temperature}°
        </Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, right: 6 }, floatStyle]}
      >
        <Text style={{ fontSize: 13, fontWeight: '900', color: palette.hot }}>+{delta}°</Text>
      </Animated.View>
    </Pressable>
  );
}
