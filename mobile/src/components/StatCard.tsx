import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  color?: string;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tint = color ?? colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: `${tint}18` }]}>
        <MaterialCommunityIcons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      alignItems: "flex-start",
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    value: { ...typography.h2, color: colors.textPrimary },
    label: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  });
