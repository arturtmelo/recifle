import React, { useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { ScreenContainer } from "../../components/ScreenContainer";
import { MaterialChip } from "../../components/Chip";
import { useLocation } from "../../hooks/useLocation";
import { useCenters } from "../../hooks/useCenters";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";
import { MATERIAL_TYPES, materialInfo, MaterialType } from "../../theme/materials";
import { MainTabsParamList, RootStackParamList } from "../../navigation/types";
import { buildLeafletHtml } from "../../components/leafletMapHtml";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Map">,
  NativeStackScreenProps<RootStackParamList>
>;

export function MapScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { coords } = useLocation();
  const [materialFilter, setMaterialFilter] = useState<MaterialType | null>(null);
  const centersQuery = useCenters({ materialType: materialFilter ?? undefined });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const webviewRef = useRef<WebView>(null);

  const centers = centersQuery.data ?? [];
  const selected = centers.find((c) => c.id === selectedId);

  const html = useMemo(() => {
    if (!coords) return null;
    return buildLeafletHtml({
      lat: coords.lat,
      lng: coords.lng,
      primaryColor: colors.primary,
      infoColor: colors.info,
      dark: isDark,
    });
  }, [coords, colors.primary, colors.info, isDark]);

  const pushCentersToMap = React.useCallback(() => {
    const payload = centers
      .filter((c) => c.lat != null && c.lng != null)
      .map((c) => ({ id: c.id, name: c.name, lat: c.lat, lng: c.lng, address: c.addressText ?? "" }));
    webviewRef.current?.injectJavaScript(`window.updateCenters(${JSON.stringify(payload)}); true;`);
  }, [centers]);

  React.useEffect(() => {
    if (mapReady) pushCentersToMap();
  }, [mapReady, pushCentersToMap]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ready") {
        setMapReady(true);
      } else if (data.type === "centerPress") {
        setSelectedId(data.id);
      }
    } catch {
      // ignora mensagens inesperadas
    }
  };

  const handleRecenter = () => {
    if (!coords) return;
    webviewRef.current?.injectJavaScript(`window.recenter(${coords.lat}, ${coords.lng}); true;`);
  };

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.filterBar}>
        <FlatList
          data={MATERIAL_TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => (
            <MaterialChip
              type={item}
              size="sm"
              selected={materialFilter === item}
              onPress={() => setMaterialFilter((prev) => (prev === item ? null : item))}
            />
          )}
        />
      </View>

      {centersQuery.isError && (
        <Pressable style={styles.errorBanner} onPress={() => centersQuery.refetch()}>
          <Ionicons name="refresh" size={16} color={colors.white} />
          <Text style={styles.errorBannerText}>Não foi possível carregar os centros. Tocar para tentar de novo.</Text>
        </Pressable>
      )}

      <View style={styles.mapWrap}>
        {html ? (
          <WebView
            key={isDark ? "dark" : "light"}
            ref={webviewRef}
            originWhitelist={["*"]}
            source={{ html }}
            style={styles.webview}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            )}
          />
        ) : (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}

        <Pressable style={styles.recenterBtn} onPress={handleRecenter}>
          <Ionicons name="locate" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {selected && (
        <Pressable style={styles.card} onPress={() => navigation.navigate("CenterProfile", { id: selected.id })}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="factory" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {selected.name}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {selected.addressText ?? "Endereço não informado"}
            </Text>
            <View style={styles.cardChips}>
              {selected.centerProfile?.materials.slice(0, 4).map((m) => (
                <View key={m} style={[styles.miniChip, { backgroundColor: `${materialInfo[m as MaterialType]?.color}18` }]}>
                  <Text style={[styles.miniChipText, { color: materialInfo[m as MaterialType]?.color }]}>
                    {materialInfo[m as MaterialType]?.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    filterBar: { paddingVertical: spacing.md },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.danger,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
    },
    errorBannerText: { ...typography.caption, color: colors.white, flex: 1 },
    mapWrap: { flex: 1 },
    webview: { flex: 1, backgroundColor: colors.background },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    recenterBtn: {
      position: "absolute",
      right: spacing.lg,
      top: spacing.lg,
      width: 42,
      height: 42,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    card: {
      position: "absolute",
      bottom: spacing.lg,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: "row",
      gap: spacing.md,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { ...typography.bodyMedium, color: colors.textPrimary },
    cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    cardChips: { flexDirection: "row", gap: 6, marginTop: spacing.sm, flexWrap: "wrap" },
    miniChip: { paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: radius.full },
    miniChipText: { ...typography.small, fontFamily: typography.captionMedium.fontFamily },
  });
