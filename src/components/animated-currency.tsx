import { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { formatCurrency } from '@/utils/format';

interface AnimatedCurrencyProps {
  value: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  duration?: number;
}

/**
 * Money roll-up: counts from the previously shown value to the new one.
 * Runs on mount and whenever the value changes, so savings feel earned.
 * Isolated leaf component — only this <Text> re-renders while it counts.
 */
export function AnimatedCurrency({
  value,
  style,
  prefix = '',
  duration = 800,
}: AnimatedCurrencyProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);
  const shownRef = useRef(shown);

  useEffect(() => {
    if (reduced) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const from = shownRef.current;
    if (from === value) return;

    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const next = t === 1 ? value : from + (value - from) * eased;
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return (
    <Text
      selectable
      accessibilityLabel={`${prefix}${formatCurrency(value)}`}
      style={[{ fontVariant: ['tabular-nums'] }, style]}
    >
      {prefix}
      {formatCurrency(shown)}
    </Text>
  );
}
