import { Stack } from 'expo-router/stack';

export default function ShoppingListStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
