import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  return (
    <Tabs
      key={language} // 當語言變化時，強制重新渲染整個 Tabs 組件
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.secondaryText,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.cardBackground,
            borderTopColor: theme.cardBorder,
            borderTopWidth: 1,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          tabBarLabel: t('navigation.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t('navigation.scan'),
          tabBarLabel: t('navigation.scan'),
          tabBarIcon: () => (
            <View style={styles.scanButtonContainer}>
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.scanButton,
                  { borderColor: theme.cardBackground },
                ]}
              >
                <Ionicons name="camera" size={28} color="white" />
              </LinearGradient>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: -4,
          },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('navigation.history'),
          tabBarLabel: t('navigation.history'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? "time" : "time-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarLabel: t('navigation.profile'),
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    height: Platform.OS === "ios" ? 88 : 70,
    paddingBottom: Platform.OS === "ios" ? 34 : 12,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabBarIcon: {
    marginTop: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  scanButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2CB67D",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
});
