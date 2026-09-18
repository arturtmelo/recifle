import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheet } from "./BottomSheet";
import { Input } from "./Input";
import { Button } from "./Button";
import { MaterialChip } from "./Chip";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { MATERIAL_TYPES, MaterialType } from "../theme/materials";
import { SortKey } from "../lib/sortListings";

export type FilterSortValue = {
  materials: MaterialType[];
  minPrice?: string;
  maxPrice?: string;
  sort: SortKey;
};

const SORT_OPTIONS: { key: SortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "relevancia", label: "Relevância", icon: "sparkles-outline" },
  { key: "distancia", label: "Mais perto", icon: "navigate-outline" },
  { key: "menor_preco", label: "Menor preço", icon: "pricetag-outline" },
  { key: "recente", label: "Mais recente", icon: "time-outline" },
];

export const DEFAULT_FILTER_SORT: FilterSortValue = { materials: [], sort: "relevancia" };

export function FilterSortSheet({
  visible,
  onClose,
  value,
  onChange,
}: {
  visible: boolean;
  onClose: () => void;
  value: FilterSortValue;
  onChange: (value: FilterSortValue) => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggleMaterial = (type: MaterialType) => {
    const has = value.materials.includes(type);
    onChange({ ...value, materials: has ? value.materials.filter((m) => m !== type) : [...value.materials, type] });
  };

  const activeFilters = value.materials.length + (value.minPrice ? 1 : 0) + (value.maxPrice ? 1 : 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filtrar e ordenar">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Ordenar por</Text>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((option) => {
            const selected = value.sort === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => onChange({ ...value, sort: option.key })}
                style={[styles.sortOption, selected && styles.sortOptionActive]}
              >
                <Ionicons name={option.icon} size={14} color={selected ? colors.white : colors.textSecondary} />
                <Text style={[styles.sortOptionText, selected && { color: colors.white }]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Materiais</Text>
        <View style={styles.chipsWrap}>
          {MATERIAL_TYPES.map((type) => (
            <MaterialChip key={type} type={type} size="sm" selected={value.materials.includes(type)} onPress={() => toggleMaterial(type)} />
          ))}
        </View>

        <Text style={styles.label}>Faixa de preço (R$/kg)</Text>
        <View style={styles.priceRow}>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Mín"
              keyboardType="decimal-pad"
              value={value.minPrice ?? ""}
              onChangeText={(t) => onChange({ ...value, minPrice: t || undefined })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="Máx"
              keyboardType="decimal-pad"
              value={value.maxPrice ?? ""}
              onChangeText={(t) => onChange({ ...value, maxPrice: t || undefined })}
            />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Button label="Limpar" variant="outline" onPress={() => onChange(DEFAULT_FILTER_SORT)} fullWidth={false} style={{ flex: 1 }} />
          <Button
            label={`Aplicar${activeFilters > 0 ? ` (${activeFilters})` : ""}`}
            onPress={onClose}
            fullWidth={false}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
    sortRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    sortOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.full,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    sortOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sortOptionText: { ...typography.captionMedium, color: colors.textSecondary },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    priceRow: { flexDirection: "row", gap: spacing.sm },
    actionsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  });
