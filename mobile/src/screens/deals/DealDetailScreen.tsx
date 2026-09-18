import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { RatingStars } from "../../components/RatingStars";
import { Input } from "../../components/Input";
import { useCreateReview, useDeal, useUpdateDealStatus } from "../../hooks/useDeals";
import { useAuth } from "../../store/AuthContext";
import { useToast } from "../../store/ToastContext";
import { getErrorMessage } from "../../services/api";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { materialInfo, MaterialType } from "../../theme/materials";
import { RootStackParamList } from "../../navigation/types";
import { DealStatus } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "DealDetail">;

const STEPS: { status: DealStatus; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { status: "CONFIRMADO", label: "Confirmado", icon: "handshake" },
  { status: "COLETA_AGENDADA", label: "Coleta agendada", icon: "calendar-clock" },
  { status: "COLETADO", label: "Coletado", icon: "truck-check-outline" },
  { status: "CONCLUIDO", label: "Concluído", icon: "check-decagram" },
];

const STATUS_LABEL: Record<DealStatus, string> = {
  CONFIRMADO: "confirmado",
  COLETA_AGENDADA: "coleta agendada",
  COLETADO: "coletado",
  CONCLUIDO: "concluído",
  CANCELADO: "cancelado",
};

export function DealDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = route.params;
  const { user } = useAuth();
  const { show } = useToast();
  const dealQuery = useDeal(id);
  const updateStatus = useUpdateDealStatus(id);
  const createReview = useCreateReview(id);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const deal = dealQuery.data;
  if (!deal) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const otherUser = deal.buyer?.id === user?.id ? deal.seller : deal.buyer;
  const stepIndex = STEPS.findIndex((s) => s.status === deal.status);
  const myReview = deal.reviews?.find((r) => r.fromUserId === user?.id);
  const receivedReview = deal.reviews?.find((r) => r.toUserId === user?.id);

  const handleScheduleConfirm = async (date: Date) => {
    setShowDatePicker(false);
    setError(null);
    try {
      await updateStatus.mutateAsync({ status: "COLETA_AGENDADA", scheduledAt: date.toISOString() });
      show("Coleta agendada!", "success");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const advanceStatus = async (status: DealStatus) => {
    setError(null);
    try {
      await updateStatus.mutateAsync({ status });
      if (status === "CONCLUIDO") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      show(`Negócio ${STATUS_LABEL[status]}!`, "success");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleSubmitReview = async () => {
    setError(null);
    try {
      await createReview.mutateAsync({ rating, comment: comment.trim() || undefined });
      show("Avaliação enviada, obrigado!", "success");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const info = deal.listing ? materialInfo[deal.listing.materialType as MaterialType] : materialInfo.OUTROS;

  return (
    <ScreenContainer edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>{deal.listing?.title}</Text>
        <Text style={styles.subtitle}>
          {info?.label} · {deal.finalQuantityKg} kg{deal.finalPricePerKg ? ` · R$ ${deal.finalPricePerKg.toFixed(2)}/kg` : " · Doação"}
        </Text>

        <View style={styles.otherCard}>
          <Avatar name={otherUser?.name ?? "?"} url={otherUser?.avatarUrl} size={44} />
          <View style={{ marginLeft: spacing.md }}>
            <Text style={styles.otherName}>{otherUser?.name}</Text>
            <Text style={styles.otherRole}>Combinando com você</Text>
          </View>
        </View>

        {deal.status !== "CANCELADO" && (
          <View style={styles.steps}>
            {STEPS.map((step, i) => {
              const active = i <= stepIndex;
              const justReached = i === stepIndex;
              return (
                <View key={step.status} style={styles.stepRow}>
                  <MotiView
                    style={[styles.stepDot, active && styles.stepDotActive]}
                    from={justReached ? { scale: 0.6 } : undefined}
                    animate={justReached ? { scale: 1 } : undefined}
                    transition={{ type: "spring", damping: 8 }}
                  >
                    <MaterialCommunityIcons name={step.icon} size={16} color={active ? colors.white : colors.textMuted} />
                  </MotiView>
                  <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step.label}</Text>
                  {i < STEPS.length - 1 && <View style={[styles.stepLine, i < stepIndex && styles.stepLineActive]} />}
                </View>
              );
            })}
          </View>
        )}

        {deal.scheduledAt && (
          <Text style={styles.scheduleText}>
            Coleta agendada para {new Date(deal.scheduledAt).toLocaleString("pt-BR")}
          </Text>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {deal.status === "CONFIRMADO" && (
          <Button label="Agendar coleta" onPress={() => setShowDatePicker(true)} style={{ marginTop: spacing.lg }} />
        )}
        {deal.status === "COLETA_AGENDADA" && (
          <Button label="Marcar como coletado" onPress={() => advanceStatus("COLETADO")} loading={updateStatus.isPending} style={{ marginTop: spacing.lg }} />
        )}
        {deal.status === "COLETADO" && (
          <Button label="Concluir negócio" onPress={() => advanceStatus("CONCLUIDO")} loading={updateStatus.isPending} style={{ marginTop: spacing.lg }} />
        )}

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(event, date) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }
              if (date) {
                setScheduledDate(date);
                handleScheduleConfirm(date);
              }
            }}
          />
        )}

        {deal.status === "CONCLUIDO" && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>{myReview ? "Sua avaliação" : "Avalie este negócio"}</Text>
            {myReview ? (
              <>
                <RatingStars rating={myReview.rating} />
                {!!myReview.comment && <Text style={styles.reviewComment}>{myReview.comment}</Text>}
              </>
            ) : (
              <>
                <RatingStars rating={rating} onChange={setRating} size={26} />
                <Input placeholder="Como foi a experiência? (opcional)" value={comment} onChangeText={setComment} style={{ marginTop: spacing.md }} />
                <Button label="Enviar avaliação" onPress={handleSubmitReview} loading={createReview.isPending} />
              </>
            )}

            {receivedReview && (
              <View style={styles.receivedReview}>
                <Text style={styles.reviewTitle}>Avaliação recebida</Text>
                <RatingStars rating={receivedReview.rating} />
                {!!receivedReview.comment && <Text style={styles.reviewComment}>{receivedReview.comment}</Text>}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    title: { ...typography.h2, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
    otherCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.lg,
    },
    otherName: { ...typography.bodyMedium, color: colors.textPrimary },
    otherRole: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    steps: { marginTop: spacing.xl },
    stepRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
    stepDot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    stepDotActive: { backgroundColor: colors.primary },
    stepLabel: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.md },
    stepLabelActive: { color: colors.textPrimary, fontFamily: typography.captionMedium.fontFamily },
    stepLine: { position: "absolute", left: 14, top: 30, width: 2, height: spacing.sm, backgroundColor: colors.border },
    stepLineActive: { backgroundColor: colors.primary },
    scheduleText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.md },
    error: { ...typography.caption, color: colors.danger, marginTop: spacing.md },
    reviewCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
    reviewTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
    reviewComment: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    receivedReview: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  });
