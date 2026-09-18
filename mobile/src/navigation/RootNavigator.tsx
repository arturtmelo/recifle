import React from "react";
import { ActivityIndicator, View } from "react-native";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { ListingDetailScreen } from "../screens/listings/ListingDetailScreen";
import { SearchScreen } from "../screens/listings/SearchScreen";
import { NegotiationDetailScreen } from "../screens/negotiations/NegotiationDetailScreen";
import { DealDetailScreen } from "../screens/deals/DealDetailScreen";
import { NotificationsScreen } from "../screens/notifications/NotificationsScreen";
import { CenterProfileScreen } from "../screens/profile/CenterProfileScreen";
import { EditCenterProfileScreen } from "../screens/profile/EditCenterProfileScreen";
import { FavoritesScreen } from "../screens/favorites/FavoritesScreen";
import { useAuth } from "../store/AuthContext";
import { useTheme } from "../theme/ThemeContext";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.danger,
    },
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="NegotiationDetail" component={NegotiationDetailScreen} />
            <Stack.Screen name="DealDetail" component={DealDetailScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CenterProfile" component={CenterProfileScreen} />
            <Stack.Screen name="EditCenterProfile" component={EditCenterProfileScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
