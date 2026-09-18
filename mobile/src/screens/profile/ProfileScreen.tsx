import React, { useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Avatar } from "../../components/Avatar";
import { StatCard } from "../../components/StatCard";
import { RatingStars } from "../../components/RatingStars";
import { EmptyState } from "../../components/EmptyState";
import { ListItemSkeleton } from "../../components/Skeleton";
import { Badge } from "../../components/Chip";
import { ImpactChart } from "../../components/ImpactChart";
import { useAuth } from "../../store/AuthContext";
import { useDeals, useUserReviews } from "../../hooks/useDeals";
import { ecoLevelColors, radius, spacing, typography, ThemeColors } from "../../theme";
import { useTheme, ThemeMode } from "../../theme/ThemeContext";
import { roleLabels } from "../../theme/materials";
import { MainTabsParamList, RootStackParamList } from "../../navigation/types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

const APPEARANCE_OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "system", label: "Automático", icon: "phone-portrait-outline" },
  { mode: "light", label: "Claro", icon: "sunny-outline" },
  { mode: "dark", label: "Escuro", icon: "moon-outline" },
];

export function ProfileScreen({ navigation }: Props) {
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, logout } = useAuth();
  const reviewsQuery = useUserReviews(user?.id);
  const dealsQuery = useDeals();

  if (!user) return null;
  const isCenter = user.role === "CENTRO";

  const avgRating = reviewsQuery.data && reviewsQuery.data.length > 0
    ? reviewsQuery.data.reduce((sum, r) => sum + r.rating, 0) / reviewsQuery.data.length
    : 0;

  return (
    <ScreenContainer style={{ paddingHorizontal: spacing.lg }}>
      <FlatList
        data={reviewsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={reviewsQuery.isRefetching || dealsQuery.isRefetching} onRefresh={() => { reviewsQuery.refetch(); dealsQuery.refetch(); }} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Perfil</Text>
              <Pressable onPress={() => navigation.navigate("Notifications")} style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.profileCard}>
              <Avatar name={user.name} url={user.avatarUrl} size={64} />
              <Text style={styles.name}>{user.name}</Text>
              <Badge label={roleLabels[user.role]} color={colors.primaryDark} />
              {!isCenter && (
                <Text style={[styles.ecoLevel, { color: ecoLevelColors[user.ecoLevel] }]}>Nível {user.ecoLevel}</Text>
              )}
              {avgRating > 0 && (
                <View style={styles.ratingRow}>
                  <RatingStars rating={Math.round(avgRating)} />
                  <Text style={styles.ratingText}>
                    {avgRating.toFixed(1)} ({reviewsQuery.data?.length} avaliações)
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <StatCard icon="scale-bathroom" label="Kg reciclados" value={`${user.totalKgRecycled}`} />
              <StatCard icon="handshake-outline" label="Negócios" value={`${user.dealsCompleted}`} color={colors.info} />
            </View>

            <Text style={styles.sectionTitle}>Seu impacto</Text>
            <ImpactChart deals={dealsQuery.data ?? []} />

            {isCenter && (
              <Pressable style={styles.menuItem} onPress={() => navigation.navigate("EditCenterProfile")}>
                <MaterialCommunityIcons name="factory" size={20} color={colors.primary} />
                <Text style={styles.menuItemText}>Editar perfil do centro</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            )}

            <Pressable style={styles.menuItem} onPress={() => navigation.navigate("Favorites")}>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
              <Text style={styles.menuItemText}>Favoritos</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            {user.addressText && (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.addressText}>{user.addressText}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Aparência</Text>
            <View style={styles.appearanceRow}>
              {APPEARANCE_OPTIONS.map((option) => {
                const selected = mode === option.mode;
                return (
                  <Pressable
                    key={option.mode}
                    onPress={() => setMode(option.mode)}
                    style={[styles.appearanceOption, selected && styles.appearanceOptionActive]}
                  >
                    <Ionicons name={option.icon} size={18} color={selected ? colors.white : colors.textSecondary} />
                    <Text style={[styles.appearanceLabel, selected && { color: colors.white }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.menuItem} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Sair</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Avaliações recebidas</Text>
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
          reviewsQuery.isLoading ? (
            <View>
              <ListItemSkeleton />
              <ListItemSkeleton />
            </View>
          ) : (
            <EmptyState icon="star-outline" title="Sem avaliações ainda" description="Elas aparecem após você concluir negócios." />
          )
        }
        ListFooterComponent={<View style={{ height: spacing.xxxl }} />}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing.md },
    title: { ...typography.h2, color: colors.textPrimary },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    profileCard: { alignItems: "center", marginTop: spacing.xl, gap: spacing.sm },
    name: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.sm },
    ecoLevel: { ...typography.bodyMedium },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
    ratingText: { ...typography.caption, color: colors.textSecondary },
    statsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    menuItemText: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
    addressRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.xs },
    addressText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md },
    appearanceRow: { flexDirection: "row", gap: spacing.sm },
    appearanceOption: {
      flex: 1,
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    appearanceOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    appearanceLabel: { ...typography.small, color: colors.textSecondary },
    reviewItem: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    reviewFrom: { ...typography.bodyMedium, color: colors.textPrimary },
    reviewComment: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  });
