import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  style,
  fullWidth = true,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles.variants[variant],
        sizeStyles[size],
        fullWidth && { alignSelf: "stretch" },
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === "primary" || variant === "danger" ? colors.white : colors.primary} />
        ) : (
          <>
            {icon}
            <Text style={[styles.label, styles.textVariants[variant], icon ? { marginLeft: spacing.sm } : undefined]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const sizeStyles: Record<Size, ViewStyle> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
};

const createStyles = (colors: ThemeColors) => {
  const variants: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: "transparent" },
    danger: { backgroundColor: colors.danger },
  };

  const textVariants: Record<Variant, ViewStyle & { color: string }> = StyleSheet.create({
    primary: { color: colors.white },
    secondary: { color: colors.primaryDark },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
    danger: { color: colors.white },
  });

  return {
    ...StyleSheet.create({
      base: {
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
      },
      content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      label: {
        ...typography.button,
      },
      disabled: {
        opacity: 0.5,
      },
    }),
    variants,
    textVariants,
  };
};
