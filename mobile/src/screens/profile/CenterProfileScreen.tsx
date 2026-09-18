import React, { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Avatar } from "../../components/Avatar";
import { MaterialChip } from "../../components/Chip";
import { RatingStars } from "../../components/RatingStars";
import { EmptyState } from "../../components/EmptyState";
import { FavoriteButton } from "../../components/FavoriteButton";
import { useCenter } from "../../hooks/useCenters";
import { useUserReviews } from "../../hooks/useDeals";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { MaterialType } from "../../theme/materials";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "CenterProfile">;

export function CenterProfileScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = route.params;
  const centerQuery = useCenter(id);
  const reviewsQuery = useUserReviews(id);
  const center = centerQuery.data;

  if (!center) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const avgRating = reviewsQuery.data && reviewsQuery.data.length > 0
    ? reviewsQuery.data.reduce((sum, r) => sum + r.rating, 0) / reviewsQuery.data.length
    : 0;

  return (
    <ScreenContainer edges={["top"]}>
      <FlatList
        data={reviewsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        refreshControl={
          <RefreshControl refreshing={reviewsQuery.isRefetching || centerQuery.isRefetching} onRefresh={() => { reviewsQuery.refetch(); centerQuery.refetch(); }} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
                <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
              </Pressable>
              <FavoriteButton targetType="CENTRO" targetId={id} />
            </View>

            <View style={styles.profileRow}>
              <Avatar name={center.name} url={center.avatarUrl} size={64} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{center.name}</Text>
                  {center.centerProfile?.verified && (
                    <MaterialCommunityIcons name="check-decagram" size={18} color={colors.info} />
                  )}
                </View>
                {avgRating > 0 && (
                  <View style={styles.ratingRow}>
                    <RatingStars rating={Math.round(avgRating)} size={14} />
                    <Text style={styles.ratingText}>{avgRating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>

            {!!center.centerProfile?.description && <Text style={styles.description}>{center.centerProfile.description}</Text>}

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{center.centerProfile?.openingHours ?? "Horário não informado"}</Text>
            </View>
            {!!center.addressText && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{center.addressText}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Materiais aceitos</Text>
            <View style={styles.chipsWrap}>
              {(center.centerProfile?.materials ?? []).map((m) => (
                <MaterialChip key={m} type={m as MaterialType} />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Avaliações</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Avatar name={item.from.name} url={item.from.avatarUrl} size={36} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewFrom}>{item.from.name}</Text>
                <RatingStars rating={item.rating} size={13} />
              </View>
              {!!item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !reviewsQuery.isLoading ? <EmptyState icon="star-outline" title="Sem avaliações ainda" /> : null
        }
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    profileRow: { flexDirection: "row", alignItems: "center" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    name: { ...typography.h2, color: colors.textPrimary },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4 },
    ratingText: { ...typography.caption, color: colors.textSecondary },
    description: { ...typography.body, color: colors.textPrimary, marginTop: spacing.lg },
    infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
    infoText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    reviewItem: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    reviewFrom: { ...typography.bodyMedium, color: colors.textPrimary },
    reviewComment: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  });
