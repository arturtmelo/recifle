import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Input({ label, error, leftIcon, rightIcon, style, ...rest }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        {leftIcon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { marginBottom: spacing.lg },
    label: { ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.xs },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      gap: spacing.sm,
    },
    inputRowFocused: {
      borderColor: colors.primary,
    },
    inputRowError: {
      borderColor: colors.danger,
    },
    input: {
      flex: 1,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.textPrimary,
    },
    error: { ...typography.small, color: colors.danger, marginTop: spacing.xs },
  });
