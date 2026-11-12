import { Stack } from 'expo-router/stack';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ToastProvider } from '@/components/toast';
import { LogoMark } from '@/components/logo';
import { VIP_NAME } from '@/constants/brand';
import { AppProvider, useApp } from '@/context/app-store';
import { AuthProvider, useAuth } from '@/context/auth';
import { palette } from '@/theme/colors';
import { colors } from '@/theme/colors';

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <RootShell />
      </AuthProvider>
    </AppProvider>
  );
}

function RootShell() {
  const { colorScheme } = useApp();
  const { status, hasEntered } = useAuth();

  // Restoring a saved session: hold on the brand screen instead of flashing the login
  const body =
    status === 'loading' ? (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.emeraldDeep,
        }}
      >
        <LogoMark size={96} />
      </View>
    ) : null;

  const content = body ?? (
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
          {/* Everything past the welcome screen needs an account or guest mode */}
          <Stack.Protected guard={hasEntered}>
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
                title: VIP_NAME,
              }}
            />
          </Stack.Protected>
          <Stack.Screen name="login" options={{ headerShown: false }} />
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
