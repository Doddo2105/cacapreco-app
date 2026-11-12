import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Icon } from '@/components/icon';
import { colors, palette } from '@/theme/colors';

export type TextFieldRef = ComponentRef<typeof TextInput>;

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  sf: string;
  md: string;
  /** Adds a show/hide toggle and masks the value */
  secure?: boolean;
  error?: string;
  hint?: string;
  ref?: Ref<TextFieldRef>;
}

/** Labeled input with leading icon, focus ring, inline error and password toggle. */
export function TextField({
  label,
  sf,
  md,
  secure = false,
  error,
  hint,
  ref,
  ...input
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.label }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 52,
          paddingHorizontal: 14,
          borderRadius: 15,
          borderCurve: 'continuous',
          backgroundColor: colors.fill,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : focused ? palette.emerald : 'transparent',
        }}
      >
        <Icon sf={sf} md={md} size={18} color={focused ? colors.tint : colors.secondaryLabel} />
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.tertiaryLabel as string}
          {...input}
          secureTextEntry={secure && !visible}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[
            { flex: 1, minWidth: 0, paddingVertical: 14, fontSize: 16, color: colors.label },
            // Remove the browser's default focus outline; the field draws its own ring
            process.env.EXPO_OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={12}
            onPress={() => setVisible((v) => !v)}
          >
            <Icon
              sf={visible ? 'eye.slash.fill' : 'eye.fill'}
              md={visible ? 'visibility-off' : 'visibility'}
              size={19}
              color={colors.secondaryLabel}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text selectable style={{ fontSize: 13, fontWeight: '600', color: colors.danger }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ fontSize: 13, color: colors.secondaryLabel }}>{hint}</Text>
      ) : null}
    </View>
  );
}
