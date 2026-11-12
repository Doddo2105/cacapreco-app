import { Text, View } from 'react-native';
import { Icon } from '@/components/icon';
import { palette } from '@/theme/colors';

/** Small glassy stat pill used on top of gradient heroes. */
export function HeroStat({
  sf,
  md,
  label,
  highlight = false,
}: {
  sf: string;
  md: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: highlight ? palette.lime : 'rgba(255, 255, 255, 0.16)',
      }}
    >
      <Icon sf={sf} md={md} size={13} color={highlight ? palette.emeraldDark : '#FFFFFF'} />
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: highlight ? palette.emeraldDark : '#FFFFFF',
          fontVariant: ['tabular-nums'],
        }}
      >
        {label}
      </Text>
    </View>
  );
}
