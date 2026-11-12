import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/native-tabs';
import { View } from 'react-native';
import { Icon } from '@/components/icon';
import { useApp } from '@/context/app-store';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  const { colorScheme } = useApp();

  if (process.env.EXPO_OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint as string,
          tabBarInactiveTintColor: colors.secondaryLabel as string,
          tabBarStyle: {
            height: 74,
            paddingTop: 8,
            paddingBottom: 10,
            backgroundColor: colors.card as string,
            borderTopWidth: 1,
            borderTopColor: colors.separator as string,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="(online)"
          options={{
            title: 'Cupons',
            tabBarIcon: ({ color, focused }) => (
              <TabPill focused={focused} isDark={colorScheme === 'dark'}>
                <Icon sf="tag.fill" md="local-offer" size={22} color={color} />
              </TabPill>
            ),
          }}
        />
        <Tabs.Screen
          name="(market)"
          options={{
            title: 'Mercados',
            tabBarIcon: ({ color, focused }) => (
              <TabPill focused={focused} isDark={colorScheme === 'dark'}>
                <Icon sf="cart.fill" md="storefront" size={22} color={color} />
              </TabPill>
            ),
          }}
        />
        <Tabs.Screen
          name="(list)"
          options={{
            title: 'Minha Cesta',
            tabBarIcon: ({ color, focused }) => (
              <TabPill focused={focused} isDark={colorScheme === 'dark'}>
                <Icon sf="checklist" md="shopping-cart" size={22} color={color} />
              </TabPill>
            ),
          }}
        />
        <Tabs.Screen
          name="(alerts)"
          options={{
            title: 'Alertas',
            tabBarIcon: ({ color, focused }) => (
              <TabPill focused={focused} isDark={colorScheme === 'dark'}>
                <Icon sf="bell.badge.fill" md="notifications-active" size={22} color={color} />
              </TabPill>
            ),
          }}
        />
      </Tabs>
    );
  }

  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor={colors.tint}>
      <NativeTabs.Trigger name="(online)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'tag', selected: 'tag.fill' }}
          md="local_offer"
        />
        <NativeTabs.Trigger.Label>Cupons</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(market)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'cart', selected: 'cart.fill' }}
          md="storefront"
        />
        <NativeTabs.Trigger.Label>Mercados</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(list)">
        <NativeTabs.Trigger.Icon
          sf="checklist"
          md="shopping_cart"
        />
        <NativeTabs.Trigger.Label>Minha Cesta</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(alerts)">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'bell', selected: 'bell.badge.fill' }}
          md="notifications_active"
        />
        <NativeTabs.Trigger.Label>Alertas</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function TabPill({
  focused,
  isDark,
  children,
}: {
  focused: boolean;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: 56,
        height: 30,
        borderRadius: 999,
        backgroundColor: focused
          ? isDark
            ? 'rgba(52, 211, 153, 0.20)'
            : 'rgba(16, 185, 129, 0.16)'
          : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
