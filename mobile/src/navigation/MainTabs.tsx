import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainTabsParamList } from "./types";
import { HomeScreen } from "../screens/home/HomeScreen";
import { MapScreen } from "../screens/map/MapScreen";
import { CreateListingScreen } from "../screens/listings/CreateListingScreen";
import { NegotiationsListScreen } from "../screens/negotiations/NegotiationsListScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { useAuth } from "../store/AuthContext";
import { radius, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

const Tab = createBottomTabNavigator<MainTabsParamList>();

function TabIcon({
  focused,
  color,
  children,
  styles,
}: {
  focused: boolean;
  color: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}) {
  return <View style={[styles.iconPill, focused && styles.iconPillActive]}>{children}</View>;
}

export function MainTabs() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const showCreateListing = user?.role !== "CENTRO";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { height: 62 + insets.bottom, paddingBottom: insets.bottom + 8 }],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon focused={focused} color={color} styles={styles}>
              <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon focused={focused} color={color} styles={styles}>
              <Ionicons name={focused ? "map" : "map-outline"} size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      {showCreateListing && (
        <Tab.Screen
          name="CreateListing"
          component={CreateListingScreen}
          options={{
            title: "Anunciar",
            tabBarIcon: () => (
              <View style={styles.fab}>
                <Ionicons name="add" size={24} color={colors.white} />
              </View>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Negotiations"
        component={NegotiationsListScreen}
        options={{
          title: "Negociações",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon focused={focused} color={color} styles={styles}>
              <MaterialCommunityIcons name={focused ? "handshake" : "handshake-outline"} size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused, size }) => (
            <TabIcon focused={focused} color={color} styles={styles}>
              <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      paddingTop: 8,
      shadowColor: "#000",
      shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.16,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
      elevation: 12,
    },
    tabBarLabel: {
      fontSize: 11,
      marginTop: 2,
    },
    iconPill: {
      width: 44,
      height: 30,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    iconPillActive: {
      backgroundColor: colors.primaryLight,
    },
    fab: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  });
