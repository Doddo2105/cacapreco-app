import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
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
