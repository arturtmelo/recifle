import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useThemeColors } from "../theme/ThemeContext";

export function ScreenContainer({
  children,
  style,
  edges = ["top"],
  background,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  background?: string;
}) {
  const colors = useThemeColors();

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background ?? colors.background }]}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
});
