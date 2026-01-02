import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootTabParamList } from "../types/navigation";
import HomeNavigator from "./HomeNavigator";
import ScanNavigator from "./ScanNavigator";
import HistoryNavigator from "./HistoryNavigator";
import ProfileNavigator from "./ProfileNavigator";
import { useLanguage } from "../i18n";

const Tab = createMaterialTopTabNavigator<RootTabParamList>();

type TabKey = keyof RootTabParamList;

type TabItem = {
  key: TabKey;
  icon: string;
  iconFilled: string;
  isScanButton?: boolean;
};

const tabConfigs: TabItem[] = [
  { key: "HomeTab", icon: "home-outline", iconFilled: "home" },
  { key: "ScanTab", icon: "camera", iconFilled: "camera", isScanButton: true },
  { key: "HistoryTab", icon: "time-outline", iconFilled: "time" },
  { key: "ProfileTab", icon: "person-outline", iconFilled: "person" },
];

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  // Map tab keys to translated labels
  const getTabLabel = (key: TabKey): string => {
    switch (key) {
      case "HomeTab":
        return t.navigation.home;
      case "ScanTab":
        return t.navigation.scan;
      case "HistoryTab":
        return t.navigation.history;
      case "ProfileTab":
        return t.navigation.profile;
      default:
        return "";
    }
  };

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = tabConfigs[index];
        const isFocused = state.index === index;
        const label = getTabLabel(tab.key);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabBarItem
            key={route.key}
            tab={tab}
            label={label}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

type TabBarItemProps = {
  tab: TabItem;
  label: string;
  isFocused: boolean;
  onPress: () => void;
};

function TabBarItem({ tab, label, isFocused, onPress }: TabBarItemProps) {
  if (tab.isScanButton) {
    return (
      <TouchableOpacity
        style={styles.tabItem}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.scanButtonContainer}>
          <LinearGradient
            colors={["#2CB67D", "#249C6A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanButton}
          >
            <Ionicons name="camera" size={28} color="white" />
          </LinearGradient>
        </View>
        <Text style={[styles.tabLabel, styles.scanLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
        <Ionicons
          name={(isFocused ? tab.iconFilled : tab.icon) as any}
          size={24}
          color={isFocused ? "#2CB67D" : "#9CA3AF"}
        />
      </View>
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: false,
        animationEnabled: true,
        lazy: true,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen name="ScanTab" component={ScanNavigator} />
      <Tab.Screen name="HistoryTab" component={HistoryNavigator} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    color: "#9CA3AF",
  },
  tabLabelActive: {
    color: "#2CB67D",
  },
  scanButtonContainer: {
    marginTop: -20,
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
  scanLabel: {
    marginTop: 0,
  },
});
