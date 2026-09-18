import React, { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Card } from "../../components/Card";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { ListItemSkeleton } from "../../components/Skeleton";
import { useNegotiations } from "../../hooks/useNegotiations";
import { useDeals } from "../../hooks/useDeals";
import { useAuth } from "../../store/AuthContext";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { materialInfo, MaterialType } from "../../theme/materials";
import { MainTabsParamList, RootStackParamList } from "../../navigation/types";
import { DealStatus, NegotiationStatus } from "../../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Negotiations">,
  NativeStackScreenProps<RootStackParamList>
>;

const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  CONFIRMADO: "Combinar coleta",
  COLETA_AGENDADA: "Coleta agendada",
  COLETADO: "Coletado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export function NegotiationsListScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const [tab, setTab] = useState<"negociacoes" | "negocios">("negociacoes");
  const negotiationsQuery = useNegotiations();
  const dealsQuery = useDeals();

  const negotiationStatusColor: Record<NegotiationStatus, string> = {
    ABERTA: colors.info,
    ACEITA: colors.success,
    RECUSADA: colors.danger,
    CANCELADA: colors.textMuted,
  };

  const dealStatusColor: Record<DealStatus, string> = {
    CONFIRMADO: colors.info,
    COLETA_AGENDADA: colors.amber,
    COLETADO: colors.primary,
    CONCLUIDO: colors.success,
    CANCELADO: colors.danger,
  };

  const openNegotiations = (negotiationsQuery.data ?? []).filter((n) => n.status === "ABERTA" || n.status === "RECUSADA");

  return (
    <ScreenContainer style={{ paddingHorizontal: spacing.lg }}>
      <Text style={styles.title}>Negociações</Text>

      <View style={styles.tabs}>
        <Pressable onPress={() => setTab("negociacoes")} style={[styles.tab, tab === "negociacoes" && styles.tabActive]}>
          <Text style={[styles.tabText, tab === "negociacoes" && styles.tabTextActive]}>Em andamento</Text>
        </Pressable>
        <Pressable onPress={() => setTab("negocios")} style={[styles.tab, tab === "negocios" && styles.tabActive]}>
          <Text style={[styles.tabText, tab === "negocios" && styles.tabTextActive]}>Negócios</Text>
        </Pressable>
      </View>

      {tab === "negociacoes" ? (
        <FlatList
          data={openNegotiations}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={negotiationsQuery.isRefetching} onRefresh={() => negotiationsQuery.refetch()} />
          }
          renderItem={({ item }) => {
            const otherUser = item.buyer?.id === user?.id ? item.seller : item.buyer;
            const info = item.listing ? materialInfo[item.listing.materialType as MaterialType] : materialInfo.OUTROS;
            const lastMessage = item.messages?.[0];
            return (
              <Card onPress={() => navigation.navigate("NegotiationDetail", { id: item.id })} style={styles.card}>
                <View style={styles.row}>
                  <Avatar name={otherUser?.name ?? "?"} url={otherUser?.avatarUrl} size={48} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.name} numberOfLines={1}>
                        {otherUser?.name ?? "Usuário"}
                      </Text>
                      <Badge label={item.status} color={negotiationStatusColor[item.status]} />
                    </View>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {info?.label} · {item.listing?.title}
                    </Text>
                    {lastMessage && (
                      <Text style={styles.preview} numberOfLines={1}>
                        {lastMessage.text}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            negotiationsQuery.isLoading ? (
              <View>
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </View>
            ) : negotiationsQuery.isError ? (
              <EmptyState
                icon="alert-circle-outline"
                title="Não foi possível carregar"
                description="Verifique sua conexão e tente novamente."
                actionLabel="Tentar novamente"
                onAction={() => negotiationsQuery.refetch()}
              />
            ) : (
              <EmptyState
                icon="handshake-outline"
                title="Nenhuma negociação ainda"
                description="Quando você propor ou receber uma proposta, ela aparece aqui."
              />
            )
          }
        />
      ) : (
        <FlatList
          data={dealsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={dealsQuery.isRefetching} onRefresh={() => dealsQuery.refetch()} />}
          renderItem={({ item }) => {
            const otherUser = item.buyer?.id === user?.id ? item.seller : item.buyer;
            return (
              <Card onPress={() => navigation.navigate("DealDetail", { id: item.id })} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.dealIcon}>
                    <MaterialCommunityIcons name="handshake" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.listing?.title}
                      </Text>
                      <Badge label={DEAL_STATUS_LABEL[item.status]} color={dealStatusColor[item.status]} />
                    </View>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      com {otherUser?.name} · {item.finalQuantityKg} kg
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            dealsQuery.isLoading ? (
              <View>
                <ListItemSkeleton />
                <ListItemSkeleton />
              </View>
            ) : dealsQuery.isError ? (
              <EmptyState
                icon="alert-circle-outline"
                title="Não foi possível carregar"
                description="Verifique sua conexão e tente novamente."
                actionLabel="Tentar novamente"
                onAction={() => dealsQuery.refetch()}
              />
            ) : (
              <EmptyState icon="handshake-outline" title="Nenhum negócio fechado" description="Negócios confirmados aparecem aqui." />
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.lg },
    tabs: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
    tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
    tabActive: { backgroundColor: colors.primary },
    tabText: { ...typography.captionMedium, color: colors.textSecondary },
    tabTextActive: { color: colors.white },
    card: { marginBottom: spacing.md },
    row: { flexDirection: "row", alignItems: "center" },
    rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
    name: { ...typography.bodyMedium, color: colors.textPrimary, flexShrink: 1 },
    listingTitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    preview: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
    dealIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
  });
