import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { materialColors, radius, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { resolveMediaUrl } from "../services/api";
import { MaterialType } from "../theme/materials";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width - 32;

export function PhotoCarousel({ photos, materialType }: { photos: string[]; materialType: MaterialType }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <View style={[styles.placeholder, { backgroundColor: `${materialColors[materialType]}1A` }]}>
        <MaterialCommunityIcons name="image-off-outline" size={40} color={materialColors[materialType]} />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE))}
        renderItem={({ item }) => (
          <Image source={{ uri: resolveMediaUrl(item) }} style={styles.image} resizeMode="cover" />
        )}
      />
      {photos.length > 1 && (
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    image: { width: ITEM_SIZE, height: 220, borderRadius: radius.lg },
    placeholder: {
      width: ITEM_SIZE,
      height: 220,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    dots: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.primary, width: 18 },
  });
