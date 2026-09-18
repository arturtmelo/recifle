import React, { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { useIsFavorited, useToggleFavorite } from "../hooks/useFavorites";
import { FavoriteTargetType } from "../services/favorites.api";

export function FavoriteButton({
  targetType,
  targetId,
  variant = "solid",
  size = 38,
}: {
  targetType: FavoriteTargetType;
  targetId: string;
  variant?: "solid" | "overlay";
  size?: number;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const favorited = useIsFavorited(targetType, targetId);
  const toggle = useToggleFavorite();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggle.mutate({ targetType, targetId });
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      style={[
        styles.base,
        variant === "overlay" ? styles.overlay : styles.solid,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <MotiView
        key={String(favorited)}
        from={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10 }}
      >
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={size * 0.5}
          color={favorited ? colors.danger : variant === "overlay" ? colors.white : colors.textSecondary}
        />
      </MotiView>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    base: { alignItems: "center", justifyContent: "center" },
    solid: { backgroundColor: colors.surface },
    overlay: { backgroundColor: "rgba(0,0,0,0.45)" },
  });
