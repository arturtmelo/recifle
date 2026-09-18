import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeColors } from "../theme/ThemeContext";

export function RatingStars({
  rating,
  size = 16,
  onChange,
}: {
  rating: number;
  size?: number;
  onChange?: (value: number) => void;
}) {
  const colors = useThemeColors();
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((value) => {
        const Wrapper = onChange ? Pressable : View;
        return (
          <Wrapper key={value} onPress={() => onChange?.(value)} hitSlop={6}>
            <Ionicons
              name={value <= rating ? "star" : "star-outline"}
              size={size}
              color={value <= rating ? colors.amber : colors.textMuted}
              style={{ marginRight: 2 }}
            />
          </Wrapper>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
