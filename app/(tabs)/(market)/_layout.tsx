import { Stack } from 'expo-router/stack';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';

export default function MarketStackLayout() {
  useApp();
  return (
    <Stack
      screenOptions={{
        headerTransparent: process.env.EXPO_OS === 'ios',
        headerStyle: { backgroundColor: colors.background as string },
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
