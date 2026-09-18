import React, { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { ListingCard } from "../../components/ListingCard";
import { MaterialChip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { ListingCardSkeleton } from "../../components/Skeleton";
import { Avatar } from "../../components/Avatar";
import { DEFAULT_FILTER_SORT, FilterSortSheet, FilterSortValue } from "../../components/FilterSortSheet";
import { useAuth } from "../../store/AuthContext";
import { useLocation } from "../../hooks/useLocation";
import { useListings } from "../../hooks/useListings";
import { useCenters } from "../../hooks/useCenters";
import { ecoLevelColors, radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { MATERIAL_TYPES, MaterialType } from "../../theme/materials";
import { MainTabsParamList, RootStackParamList } from "../../navigation/types";
import { filterByPriceRange, sortListings } from "../../lib/sortListings";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { coords } = useLocation();
  const [materialFilter, setMaterialFilter] = useState<MaterialType | null>(null);
  const [filterSort, setFilterSort] = useState<FilterSortValue>(DEFAULT_FILTER_SORT);
  const [showFilters, setShowFilters] = useState(false);
  const isCenter = user?.role === "CENTRO";

  const listingsQuery = useListings({
    lat: coords?.lat,
    lng: coords?.lng,
    materialType: materialFilter ?? undefined,
    ownerId: isCenter ? undefined : user?.id,
  });

  const centersQuery = useCenters({ lat: coords?.lat, lng: coords?.lng });

  const listings = useMemo(() => {
    let data = listingsQuery.data ?? [];
    if (filterSort.materials.length > 0) {
      data = data.filter((l) => filterSort.materials.includes(l.materialType as MaterialType));
    }
    data = filterByPriceRange(
      data,
      filterSort.minPrice ? Number(filterSort.minPrice) : undefined,
      filterSort.maxPrice ? Number(filterSort.maxPrice) : undefined
    );
    return sortListings(data, filterSort.sort);
  }, [listingsQuery.data, filterSort]);

  const activeFilters = filterSort.materials.length + (filterSort.minPrice ? 1 : 0) + (filterSort.maxPrice ? 1 : 0);

  return (
    <ScreenContainer style={{ paddingHorizontal: spacing.lg }}>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={listingsQuery.isRefetching} onRefresh={() => listingsQuery.refetch()} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greeting}>Olá, {user?.name?.split(" ")[0]} 👋</Text>
                <Text style={styles.subGreeting}>
                  {isCenter ? "Materiais disponíveis perto de você" : "O que você quer reciclar hoje?"}
                </Text>
              </View>
              <Pressable onPress={() => navigation.navigate("Notifications")} style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              </Pressable>
              <Pressable onPress={() => navigation.navigate("Profile")} style={{ marginLeft: spacing.sm }}>
                <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size={40} />
              </Pressable>
            </View>

            {!isCenter && (
              <View style={styles.ecoCard}>
                <View>
                  <Text style={styles.ecoLabel}>Seu nível eco</Text>
                  <Text style={[styles.ecoLevel, { color: ecoLevelColors[user?.ecoLevel ?? "Bronze"] }]}>
                    {user?.ecoLevel}
                  </Text>
                </View>
                <View style={styles.ecoStat}>
                  <Text style={styles.ecoStatValue}>{user?.totalKgRecycled ?? 0} kg</Text>
                  <Text style={styles.ecoStatLabel}>reciclados</Text>
                </View>
                <View style={styles.ecoStat}>
                  <Text style={styles.ecoStatValue}>{user?.dealsCompleted ?? 0}</Text>
                  <Text style={styles.ecoStatLabel}>negócios</Text>
                </View>
              </View>
            )}

            <View style={styles.searchRow}>
              <Pressable onPress={() => navigation.navigate("Search")} style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <Text style={styles.searchPlaceholder}>Buscar por material, título...</Text>
              </Pressable>
              <Pressable onPress={() => setShowFilters(true)} style={styles.filterBtn}>
                <Ionicons name="options-outline" size={20} color={colors.primary} />
                {activeFilters > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFilters}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <FlatList
              data={MATERIAL_TYPES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}
              renderItem={({ item }) => (
                <MaterialChip
                  type={item}
                  size="sm"
                  selected={materialFilter === item}
                  onPress={() => setMaterialFilter((prev) => (prev === item ? null : item))}
                />
              )}
            />

            {!isCenter && (
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Meus anúncios</Text>
                <Text style={styles.sectionLink} onPress={() => navigation.navigate("CreateListing")}>
                  + Novo
                </Text>
              </View>
            )}
            {isCenter && <Text style={styles.sectionTitle}>Anúncios disponíveis</Text>}

            {listingsQuery.isLoading && (
              <View style={{ marginTop: spacing.md }}>
                <ListingCardSkeleton />
                <ListingCardSkeleton />
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <ListingCard listing={item} index={index} onPress={() => navigation.navigate("ListingDetail", { id: item.id })} />
        )}
        ListEmptyComponent={
          listingsQuery.isLoading ? null : listingsQuery.isError ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Não foi possível carregar"
              description="Verifique sua conexão e tente novamente."
              actionLabel="Tentar novamente"
              onAction={() => listingsQuery.refetch()}
            />
          ) : (
            <EmptyState
              icon={isCenter ? "magnify" : "leaf-circle-outline"}
              title={isCenter ? "Nenhum anúncio por aqui ainda" : "Você ainda não publicou nada"}
              description={
                isCenter
                  ? "Assim que a população ou fornecedores publicarem materiais perto de você, eles aparecem aqui."
                  : "Publique seu primeiro material reciclável e conecte-se com centros de reciclagem."
              }
              actionLabel={!isCenter ? "Criar anúncio" : undefined}
              onAction={!isCenter ? () => navigation.navigate("CreateListing") : undefined}
            />
          )
        }
        ListFooterComponent={
          !isCenter && centersQuery.data && centersQuery.data.length > 0 ? (
            <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxxl }}>
              <Text style={styles.sectionTitle}>Centros perto de você</Text>
              <FlatList
                data={centersQuery.data.slice(0, 6)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.md }}
                renderItem={({ item }) => (
                  <Pressable style={styles.centerCard} onPress={() => navigation.navigate("CenterProfile", { id: item.id })}>
                    <View style={styles.centerIcon}>
                      <MaterialCommunityIcons name="factory" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.centerName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.centerDistance}>{item.distanceKm ?? "—"} km</Text>
                  </Pressable>
                )}
              />
            </View>
          ) : (
            <View style={{ height: spacing.xxxl }} />
          )
        }
      />

      <FilterSortSheet visible={showFilters} onClose={() => setShowFilters(false)} value={filterSort} onChange={setFilterSort} />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", paddingTop: spacing.md },
    greeting: { ...typography.h2, color: colors.textPrimary },
    subGreeting: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    ecoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    ecoLabel: { ...typography.caption, color: colors.textSecondary },
    ecoLevel: { ...typography.h3 },
    ecoStat: { marginLeft: "auto", alignItems: "flex-end", paddingLeft: spacing.lg },
    ecoStatValue: { ...typography.bodyMedium, color: colors.textPrimary },
    ecoStatLabel: { ...typography.small, color: colors.textMuted },
    searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.lg },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchPlaceholder: { ...typography.body, color: colors.textMuted },
    filterBtn: {
      width: 46,
      height: 46,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    filterBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      backgroundColor: colors.danger,
      borderRadius: radius.full,
      minWidth: 16,
      height: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    filterBadgeText: { color: colors.white, fontSize: 10, fontWeight: "700" },
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
    sectionLink: { ...typography.captionMedium, color: colors.primary },
    centerCard: {
      width: 130,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    centerIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    centerName: { ...typography.captionMedium, color: colors.textPrimary },
    centerDistance: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  });
