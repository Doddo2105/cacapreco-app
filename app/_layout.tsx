import { Stack } from 'expo-router/stack';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AppProvider } from '@/context/app-store';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerTintColor: colors.tint as string,
            headerTitleStyle: { color: colors.label as string },
            headerBackButtonDisplayMode: 'minimal',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="deal/[id]"
            options={{
              title: 'Detalhes da Promoção',
            }}
          />
          <Stack.Screen
            name="deal/new"
            options={{
              presentation: 'modal',
              title: 'Publicar Oferta / Encarte IA',
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.85, 1.0],
              title: 'CaçaPreço VIP',
            }}
          />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}
