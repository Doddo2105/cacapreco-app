import { Stack } from 'expo-router/stack';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ToastProvider } from '@/components/toast';
import { AppProvider, useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_OS === 'web' && typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `;
      document.head.appendChild(style);
      return () => {
        style.remove();
      };
    }
  }, []);

  return (
    <AppProvider>
      <RootShell />
    </AppProvider>
  );
}

function RootShell() {
  const { colorScheme } = useApp();

  const content = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background as string },
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
      </ToastProvider>
    </ThemeProvider>
  );

  if (process.env.EXPO_OS !== 'web') {
    return content;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B1310',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 420,
          maxWidth: '100%',
          height: 912,
          maxHeight: '100%',
          backgroundColor: colors.background,
          overflow: 'hidden',
        }}
      >
        {content}
      </View>
    </View>
  );
}
