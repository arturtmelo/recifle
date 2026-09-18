import React, { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { MotiView } from "moti";
import { radius, spacing, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

export function Skeleton({ width, height, style }: { width: number | `${number}%`; height: number; style?: ViewStyle }) {
  const colors = useThemeColors();
  return (
    <MotiView
      style={[{ width, height, borderRadius: radius.sm, backgroundColor: colors.border }, style]}
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 700, loop: true }}
    />
  );
}

export function ListingCardSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={140} style={{ borderRadius: radius.lg }} />
      <View style={{ padding: spacing.md }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="45%" height={13} style={{ marginBottom: spacing.md }} />
        <Skeleton width="90%" height={13} />
      </View>
    </View>
  );
}

export function ListItemSkeleton() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Skeleton width={48} height={48} style={{ borderRadius: radius.full }} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Skeleton width="55%" height={14} style={{ marginBottom: spacing.sm }} />
        <Skeleton width="80%" height={12} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      overflow: "hidden",
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
  });
