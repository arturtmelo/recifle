import React, { useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScreenContainer } from "../../components/ScreenContainer";
import { EmptyState } from "../../components/EmptyState";
import { ListItemSkeleton } from "../../components/Skeleton";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../hooks/useNotifications";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { RootStackParamList } from "../../navigation/types";
import { AppNotification, NotificationType } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

const ICONS: Record<NotificationType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  NOVA_PROPOSTA: "hand-coin-outline",
  CONTRA_PROPOSTA: "swap-horizontal",
  PROPOSTA_ACEITA: "handshake",
  PROPOSTA_RECUSADA: "close-circle-outline",
  NOVA_MENSAGEM: "message-outline",
  NEGOCIO_ATUALIZADO: "truck-check-outline",
  NOVA_AVALIACAO: "star-outline",
};

export function NotificationsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const notificationsQuery = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    try {
      const data = notification.data ? JSON.parse(notification.data) : null;
      if (data?.negotiationId) {
        navigation.navigate("NegotiationDetail", { id: data.negotiationId });
      } else if (data?.dealId) {
        navigation.navigate("DealDetail", { id: data.dealId });
      }
    } catch {
      // dados sem navegação associada
    }
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: spacing.lg }} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Notificações</Text>
        <Pressable onPress={() => markAllRead.mutate()}>
          <Text style={styles.markAll}>Marcar todas</Text>
        </Pressable>
      </View>

      <FlatList
        data={notificationsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={notificationsQuery.isRefetching} onRefresh={() => notificationsQuery.refetch()} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item)} style={[styles.item, !item.read && styles.itemUnread]}>
            <View style={[styles.iconWrap, !item.read && { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name={ICONS[item.type]} size={18} color={!item.read ? colors.white : colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.itemTime}>
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR })}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          notificationsQuery.isLoading ? (
            <View>
              <ListItemSkeleton />
              <ListItemSkeleton />
              <ListItemSkeleton />
            </View>
          ) : notificationsQuery.isError ? (
            <EmptyState
              icon="alert-circle-outline"
              title="Não foi possível carregar"
              actionLabel="Tentar novamente"
              onAction={() => notificationsQuery.refetch()}
            />
          ) : (
            <EmptyState icon="bell-outline" title="Nenhuma notificação" description="Você será avisado sobre propostas, mensagens e negócios aqui." />
          )
        }
      />
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
    markAll: { ...typography.captionMedium, color: colors.primary },
    item: { flexDirection: "row", padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm },
    itemUnread: { backgroundColor: colors.primaryLight },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    itemTitle: { ...typography.bodyMedium, color: colors.textPrimary },
    itemBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    itemTime: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  });
