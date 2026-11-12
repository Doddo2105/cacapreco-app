import { Pressable, Text, useColorScheme, View } from 'react-native';
import { Icon } from '@/components/icon';
import { colors, gradientBg, gradients, palette, shadows } from '@/theme/colors';
import { haptics } from '@/utils/format';

export interface SegmentedTabOption<T extends string> {
  key: T;
  label: string;
  sf?: string;
  md?: string;
  badge?: number | string;
}

interface SegmentedTabsProps<T extends string> {
  options: SegmentedTabOption<T>[];
  value: T;
  onChange: (next: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  useColorScheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderRadius: 18,
        borderCurve: 'continuous',
        padding: 5,
        gap: 6,
        boxShadow: shadows.card,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) {
                haptics.tap();
                onChange(opt.key);
              }
            }}
            style={[
              {
                flex: 1,
                minHeight: 44,
                borderRadius: 14,
                borderCurve: 'continuous',
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                backgroundColor: active ? palette.emeraldDeep : 'transparent',
              },
              active ? gradientBg(gradients.money) : null,
            ]}
          >
            {opt.sf && opt.md ? (
              <Icon
                sf={opt.sf}
                md={opt.md}
                size={16}
                color={active ? '#FFFFFF' : colors.secondaryLabel}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 14,
                fontWeight: '800',
                color: active ? '#FFFFFF' : colors.secondaryLabel,
              }}
            >
              {opt.label}
            </Text>
            {opt.badge !== undefined ? (
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: active ? 'rgba(255, 255, 255, 0.24)' : colors.fill,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: active ? '#FFFFFF' : colors.secondaryLabel,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {opt.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
