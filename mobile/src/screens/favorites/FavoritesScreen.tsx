import React, { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ListingCard } from "../../components/ListingCard";
import { EmptyState } from "../../components/EmptyState";
import { ListingCardSkeleton, ListItemSkeleton } from "../../components/Skeleton";
import { FavoriteButton } from "../../components/FavoriteButton";
import { useFavoriteCenters, useFavoriteListings } from "../../hooks/useFavorites";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Favorites">;

export function FavoritesScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<"listings" | "centers">("listings");
  const listingsQuery = useFavoriteListings();
  const centersQuery = useFavoriteCenters();

  return (
    <ScreenContainer style={{ paddingHorizontal: spacing.lg }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Favoritos</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("listings")} style={[styles.tab, tab === "listings" && styles.tabActive]}>
          <Text style={[styles.tabText, tab === "listings" && styles.tabTextActive]}>Anúncios</Text>
        </Pressable>
        <Pressable onPress={() => setTab("centers")} style={[styles.tab, tab === "centers" && styles.tabActive]}>
          <Text style={[styles.tabText, tab === "centers" && styles.tabTextActive]}>Centros</Text>
        </Pressable>
      </View>

      {tab === "listings" ? (
        <FlatList
          data={listingsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={listingsQuery.isRefetching} onRefresh={() => listingsQuery.refetch()} />
          }
          renderItem={({ item, index }) => (
            <ListingCard listing={item} index={index} onPress={() => navigation.navigate("ListingDetail", { id: item.id })} />
          )}
          ListEmptyComponent={
            listingsQuery.isLoading ? (
              <View>
                <ListingCardSkeleton />
              </View>
            ) : (
              <EmptyState icon="heart-outline" title="Nenhum anúncio favoritado" description="Toque no coração em um anúncio para salvá-lo aqui." />
            )
          }
        />
      ) : (
        <FlatList
          data={centersQuery.data ?? []}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={centersQuery.isRefetching} onRefresh={() => centersQuery.refetch()} />}
          renderItem={({ item }) => (
            <Pressable style={styles.centerRow} onPress={() => navigation.navigate("CenterProfile", { id: item.id })}>
              <View style={styles.centerIcon}>
                <MaterialCommunityIcons name="factory" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.centerName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.centerAddress} numberOfLines={1}>
                  {item.addressText ?? "Endereço não informado"}
                </Text>
              </View>
              <FavoriteButton targetType="CENTRO" targetId={item.id} />
            </Pressable>
          )}
          ListEmptyComponent={
            centersQuery.isLoading ? (
              <View>
                <ListItemSkeleton />
              </View>
            ) : (
              <EmptyState icon="heart-outline" title="Nenhum centro favoritado" description="Toque no coração no perfil de um centro para salvá-lo aqui." />
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.md, marginBottom: spacing.lg },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { ...typography.h3, color: colors.textPrimary },
    tabs: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
    tabActive: { backgroundColor: colors.primary },
    tabText: { ...typography.captionMedium, color: colors.textSecondary },
    tabTextActive: { color: colors.white },
    centerRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    centerIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    centerName: { ...typography.bodyMedium, color: colors.textPrimary },
    centerAddress: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  });
