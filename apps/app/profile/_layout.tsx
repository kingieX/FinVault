import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="editProfile" options={{ headerShown: false }} />
      <Stack.Screen name="changePassword" options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" options={{ headerShown: false }} />
      <Stack.Screen name="ContactUs" options={{ headerShown: false }} />
      <Stack.Screen name="FAQ" options={{ headerShown: false }} />
    </Stack>
  );
}
