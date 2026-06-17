import { Tabs } from 'expo-router';

import { TabBar, type TabBarProps } from '@/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="spots" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
