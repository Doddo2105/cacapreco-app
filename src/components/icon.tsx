import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

type MaterialName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  /** SF Symbol name used on iOS */
  sf: string;
  /** Material icon name used on Android / web */
  md: string;
  size?: number;
  color: ColorValue;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * One icon family per platform: SF Symbols on iOS, Material Icons elsewhere.
 */
export function Icon({ sf, md, size = 20, color, weight = 'regular' }: IconProps) {
  if (process.env.EXPO_OS === 'ios') {
    return (
      <SymbolView
        name={sf as SFSymbol}
        tintColor={color as string}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={{ width: size, height: size }}
      />
    );
  }
  return <MaterialIcons name={md as MaterialName} size={size} color={color as string} />;
}
