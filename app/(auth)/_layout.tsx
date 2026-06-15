import { Stack } from 'expo-router'
import { colors } from '@/lib/theme'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      {/* Deep-link callback: handles email confirmation + password recovery codes */}
      <Stack.Screen name="callback" options={{ gestureEnabled: false }} />
      {/* Password reset — both "forgot" (email request) and "set new password" modes */}
      <Stack.Screen name="reset-password" />
    </Stack>
  )
}
