import { Link, Stack } from 'expo-router';
import { Text, useColorScheme, View } from 'react-native';
import { colors } from '@/theme/colors';

export default function NotFoundScreen() {
  useColorScheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          gap: 12,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.label }}>
          Tela não encontrada
        </Text>
        <Link href="/" style={{ fontSize: 15, fontWeight: '600', color: colors.tint }}>
          Voltar para Orçamentos
        </Link>
      </View>
    </>
  );
}
