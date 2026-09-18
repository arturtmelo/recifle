import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MotiView } from "moti";
import { Card } from "./Card";
import { Listing } from "../types";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { materialInfo, MaterialType } from "../theme/materials";
import { resolveMediaUrl } from "../services/api";
import { FavoriteButton } from "./FavoriteButton";

export function ListingCard({ listing, onPress, index = 0 }: { listing: Listing; onPress: () => void; index?: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const info = materialInfo[listing.materialType as MaterialType] ?? materialInfo.OUTROS;
  const photo = resolveMediaUrl(listing.photos[0]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 60 }}
    >
      <Card onPress={onPress} padded={false} style={styles.card}>
        <View style={styles.imageWrap}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imageFallback, { backgroundColor: `${info.color}18` }]}>
              <MaterialCommunityIcons name={info.icon} size={34} color={info.color} />
            </View>
          )}
          <View style={[styles.materialTag, { backgroundColor: info.color }]}>
            <MaterialCommunityIcons name={info.icon} size={12} color={colors.white} />
            <Text style={styles.materialTagText}>{info.label}</Text>
          </View>
          {listing.priceType === "DOACAO" ? (
            <View style={[styles.priceTag, { backgroundColor: colors.accent }]}>
              <Text style={styles.priceTagText}>Doação</Text>
            </View>
          ) : (
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>R$ {listing.pricePerKg?.toFixed(2)}/kg</Text>
            </View>
          )}
          <View style={styles.favoriteWrap}>
            <FavoriteButton targetType="LISTING" targetId={listing.id} variant="overlay" size={32} />
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="scale-bathroom" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{listing.quantityKg} kg</Text>
            {listing.distanceKm !== undefined && (
              <>
                <View style={styles.dotSep} />
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{listing.distanceKm} km</Text>
              </>
            )}
          </View>
          {listing.owner && (
            <Text style={styles.owner} numberOfLines={1}>
              por {listing.owner.name}
            </Text>
          )}
        </View>
      </Card>
    </MotiView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { overflow: "hidden", marginBottom: spacing.lg },
    imageWrap: { position: "relative" },
    image: { width: "100%", height: 150 },
    imageFallback: { alignItems: "center", justifyContent: "center" },
    materialTag: {
      position: "absolute",
      top: spacing.sm,
      left: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.full,
    },
    materialTagText: { color: colors.white, ...typography.small, fontFamily: typography.captionMedium.fontFamily },
    priceTag: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: colors.textPrimary,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.full,
    },
    priceTagText: { color: colors.white, ...typography.small, fontFamily: typography.captionMedium.fontFamily },
    favoriteWrap: { position: "absolute", bottom: spacing.sm, right: spacing.sm },
    body: { padding: spacing.md },
    title: { ...typography.h3, color: colors.textPrimary, fontSize: 16 },
    metaRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs, gap: 4 },
    metaText: { ...typography.caption, color: colors.textSecondary },
    dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 4 },
    owner: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  });
