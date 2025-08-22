import { Stack } from "expo-router";

export default function PortfolioLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="SearchAsset" options={{ headerShown: false }} />
      <Stack.Screen name="AddTransaction" options={{ headerShown: false }} />
      <Stack.Screen name="AssetDetail" options={{ headerShown: false }} />
    </Stack>
  );
}
