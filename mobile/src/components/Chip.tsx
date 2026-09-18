import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { radius, spacing, typography } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { materialInfo, MaterialType } from "../theme/materials";

export function MaterialChip({
  type,
  selected,
  onPress,
  size = "md",
}: {
  type: MaterialType;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
}) {
  const colors = useThemeColors();
  const info = materialInfo[type];
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      style={[
        styles.base,
        size === "sm" && styles.baseSm,
        { borderColor: info.color, backgroundColor: selected ? info.color : `${info.color}14` },
      ]}
    >
      <MaterialCommunityIcons name={info.icon} size={size === "sm" ? 14 : 16} color={selected ? colors.white : info.color} />
      <Text style={[styles.label, size === "sm" && styles.labelSm, { color: selected ? colors.white : info.color }]}>
        {info.label}
      </Text>
    </Wrapper>
  );
}

export function Badge({ label, color, textColor }: { label: string; color: string; textColor?: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeLabel, { color: textColor ?? colors.white }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  baseSm: {
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
  },
  label: {
    ...typography.captionMedium,
  },
  labelSm: {
    ...typography.small,
    fontFamily: typography.captionMedium.fontFamily,
  },
  badge: {
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    alignSelf: "flex-start",
  },
  badgeLabel: {
    ...typography.small,
    fontFamily: typography.captionMedium.fontFamily,
  },
});
