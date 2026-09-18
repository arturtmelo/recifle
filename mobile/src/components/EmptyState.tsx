import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { Button } from "./Button";

export function EmptyState({
  icon = "recycle-variant",
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} style={{ marginTop: spacing.lg }} />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", padding: spacing.xxl },
    iconWrap: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    title: { ...typography.h3, color: colors.textPrimary, textAlign: "center" },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: spacing.xs,
    },
  });
