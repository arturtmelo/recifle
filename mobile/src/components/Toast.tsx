import React, { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "../theme/ThemeContext";
import { radius, spacing, typography, ThemeColors } from "../theme";

export type ToastVariant = "success" | "error" | "info";

const ICONS: Record<ToastVariant, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "alert-circle",
  info: "information-circle",
};

export function Toast({
  toast,
  onHide,
}: {
  toast: { id: number; message: string; variant: ToastVariant } | null;
  onHide: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const variantColor = toast
    ? { success: colors.success, error: colors.danger, info: colors.info }[toast.variant]
    : colors.info;

  return (
    <AnimatePresence>
      {toast && (
        <MotiView
          key={toast.id}
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          transition={{ type: "timing", duration: 250 }}
          style={[styles.container, { top: insets.top + spacing.sm }]}
          onTouchEnd={onHide}
        >
          <Ionicons name={ICONS[toast.variant]} size={20} color={variantColor} />
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      zIndex: 999,
    },
    message: { ...typography.captionMedium, color: colors.textPrimary, flex: 1 },
  });
