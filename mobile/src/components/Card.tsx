import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { radius, shadow, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";

type Props = ViewProps & {
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
};

export function Card({ children, onPress, style, padded = true, ...rest }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <View style={[styles.base, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      ...shadow.card,
    },
    padded: {
      padding: 16,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
  });
