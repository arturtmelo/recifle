import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { radius, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { resolveMediaUrl } from "../services/api";

export function Avatar({ name, url, size = 44 }: { name: string; url?: string | null; size?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const resolved = resolveMediaUrl(url);

  if (resolved) {
    return <Image source={{ uri: resolved }} style={{ width: size, height: size, borderRadius: radius.full }} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius.full }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials || "?"}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    fallback: {
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    initials: {
      color: colors.primaryDark,
      fontFamily: typography.h3.fontFamily,
    },
  });
