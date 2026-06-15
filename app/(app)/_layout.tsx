import { Tabs } from 'expo-router'
import { colors, tabBarConfig } from '@/lib/theme'

/**
 * Tab navigator — 4 tabs per blueprint section 7 navigation structure.
 * Tab bar uses navy active tint per brand guidelines.
 */
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarConfig.activeTintColor,
        tabBarInactiveTintColor: tabBarConfig.inactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarConfig.backgroundColor,
          borderTopColor: tabBarConfig.borderTopColor,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabIcon label="🗺️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-meetups"
        options={{
          title: 'Meetups',
          tabBarIcon: ({ color }) => <TabIcon label="⚓" color={color} />,
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color }) => <TabIcon label="🔧" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon label="👤" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ label, color }: { label: string; color: string }) {
  // Phase 5 will replace these emoji with proper icon assets
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 22 }}>{label}</Text>
}
