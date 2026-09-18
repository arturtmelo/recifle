import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Input } from "../../components/Input";
import { ListingCard } from "../../components/ListingCard";
import { EmptyState } from "../../components/EmptyState";
import { ListingCardSkeleton } from "../../components/Skeleton";
import { DEFAULT_FILTER_SORT, FilterSortSheet, FilterSortValue } from "../../components/FilterSortSheet";
import { useListings } from "../../hooks/useListings";
import { useLocation } from "../../hooks/useLocation";
import { radius, spacing, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { RootStackParamList } from "../../navigation/types";
import { MaterialType } from "../../theme/materials";
import { filterByPriceRange, sortListings } from "../../lib/sortListings";

type Props = NativeStackScreenProps<RootStackParamList, "Search">;

export function SearchScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [search, setSearch] = useState("");
  const [filterSort, setFilterSort] = useState<FilterSortValue>(DEFAULT_FILTER_SORT);
  const [showFilters, setShowFilters] = useState(false);
  const { coords } = useLocation();

  const listingsQuery = useListings({
    lat: coords?.lat,
    lng: coords?.lng,
    search: search.trim() || undefined,
    materialType: filterSort.materials.length === 1 ? filterSort.materials[0] : undefined,
  });

  const results = useMemo(() => {
    let data = listingsQuery.data ?? [];
    if (filterSort.materials.length > 1) {
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Input
            placeholder="Buscar por material, título..."
            value={search}
            onChangeText={setSearch}
            autoFocus
            style={{ paddingVertical: spacing.sm }}
          />
        </View>
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
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <ListingCard listing={item} index={index} onPress={() => navigation.navigate("ListingDetail", { id: item.id })} />
        )}
        ListEmptyComponent={
          listingsQuery.isLoading ? (
            <View>
              <ListingCardSkeleton />
              <ListingCardSkeleton />
            </View>
          ) : (
            <EmptyState icon="magnify" title="Nada encontrado" description="Tente outro termo, material ou faixa de preço." />
          )
        }
      />

      <FilterSortSheet visible={showFilters} onClose={() => setShowFilters(false)} value={filterSort} onChange={setFilterSort} />
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", paddingTop: spacing.md, marginBottom: spacing.lg, gap: spacing.sm },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    filterBtn: {
      width: 38,
      height: 38,
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
  });
