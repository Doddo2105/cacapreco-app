import { Stack } from 'expo-router/stack';
import { useColorScheme } from 'react-native';
import { colors } from '@/theme/colors';

export default function MarketStackLayout() {
  useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerTransparent: process.env.EXPO_OS === 'ios',
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { color: colors.label as string },
        headerLargeTitleEnabled: true,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mercados & Atacado' }} />
    </Stack>
  );
}
