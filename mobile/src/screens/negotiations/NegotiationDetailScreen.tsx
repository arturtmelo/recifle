import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Avatar } from "../../components/Avatar";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useNegotiation, useSendMessage, useSendOffer } from "../../hooks/useNegotiations";
import { useAuth } from "../../store/AuthContext";
import { useToast } from "../../store/ToastContext";
import { getErrorMessage } from "../../services/api";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "NegotiationDetail">;

type TimelineItem =
  | { kind: "offer"; id: string; authorId: string; createdAt: string; type: string; pricePerKg: number | null; quantityKg: number; message: string | null }
  | { kind: "message"; id: string; senderId: string; createdAt: string; text: string };

const OFFER_LABEL: Record<string, string> = {
  PROPOSTA: "Proposta enviada",
  CONTRA: "Contraproposta",
  ACEITE: "Proposta aceita",
  RECUSA: "Proposta recusada",
};

export function NegotiationDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = route.params;
  const { user } = useAuth();
  const { show } = useToast();
  const negotiationQuery = useNegotiation(id);
  const sendOffer = useSendOffer(id);
  const sendMessage = useSendMessage(id);

  const [text, setText] = useState("");
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterQty, setCounterQty] = useState("");
  const [counterMsg, setCounterMsg] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const negotiation = negotiationQuery.data;

  const timeline: TimelineItem[] = useMemo(() => {
    if (!negotiation) return [];
    const offers: TimelineItem[] = (negotiation.offers ?? []).map((o) => ({ kind: "offer", ...o }));
    const messages: TimelineItem[] = (negotiation.messages ?? []).map((m) => ({ kind: "message", ...m }));
    return [...offers, ...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [negotiation]);

  if (!negotiation) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const otherUser = negotiation.buyer?.id === user?.id ? negotiation.seller : negotiation.buyer;
  const lastOffer = [...(negotiation.offers ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
  const canRespond = negotiation.status === "ABERTA" && lastOffer && lastOffer.authorId !== user?.id;

  const openCounterForm = () => {
    setCounterPrice(lastOffer?.pricePerKg ? String(lastOffer.pricePerKg) : "");
    setCounterQty(lastOffer ? String(lastOffer.quantityKg) : "");
    setShowCounterForm(true);
  };

  const handleAccept = async () => {
    setActionError(null);
    try {
      await sendOffer.mutateAsync({ type: "ACEITE" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      show("Negócio fechado! Combine a coleta.", "success");
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  const handleReject = async () => {
    setActionError(null);
    try {
      await sendOffer.mutateAsync({ type: "RECUSA" });
      show("Proposta recusada.", "info");
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  const handleCounter = async () => {
    setActionError(null);
    try {
      await sendOffer.mutateAsync({
        type: "CONTRA",
        pricePerKg: counterPrice ? Number(counterPrice) : undefined,
        quantityKg: counterQty ? Number(counterQty) : undefined,
        message: counterMsg.trim() || undefined,
      });
      setShowCounterForm(false);
      setCounterMsg("");
      show("Contraproposta enviada!", "success");
    } catch (e) {
      setActionError(getErrorMessage(e));
    }
  };

  const handleSendMessage = async () => {
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
    await sendMessage.mutateAsync(value);
  };

  return (
    <ScreenContainer edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Avatar name={otherUser?.name ?? "?"} url={otherUser?.avatarUrl} size={38} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.name}
            </Text>
            <Text style={styles.headerListing} numberOfLines={1}>
              {negotiation.listing?.title}
            </Text>
          </View>
          {negotiation.deal && (
            <Pressable onPress={() => navigation.navigate("DealDetail", { id: negotiation.deal!.id })} style={styles.dealLink}>
              <Text style={styles.dealLinkText}>Ver negócio</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={timeline}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const mine = item.kind === "offer" ? item.authorId === user?.id : item.senderId === user?.id;
            if (item.kind === "offer") {
              return (
                <View style={[styles.offerBubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.offerLabel, mine && { color: colors.white }]}>{OFFER_LABEL[item.type]}</Text>
                  {item.type !== "RECUSA" && (
                    <Text style={[styles.offerDetail, mine && { color: colors.white }]}>
                      {item.pricePerKg ? `R$ ${item.pricePerKg.toFixed(2)}/kg · ` : "Doação · "}
                      {item.quantityKg} kg
                    </Text>
                  )}
                  {!!item.message && <Text style={[styles.offerMessage, mine && { color: "rgba(255,255,255,0.9)" }]}>{item.message}</Text>}
                </View>
              );
            }
            return (
              <View style={[styles.messageBubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.messageText, mine && { color: colors.white }]}>{item.text}</Text>
              </View>
            );
          }}
        />

        {!!actionError && <Text style={styles.error}>{actionError}</Text>}

        {showCounterForm && (
          <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} style={styles.counterForm}>
            <Input label="Quantidade (kg)" keyboardType="numeric" value={counterQty} onChangeText={setCounterQty} />
            <Input label="Preço por kg (R$)" keyboardType="decimal-pad" value={counterPrice} onChangeText={setCounterPrice} />
            <Input label="Mensagem (opcional)" value={counterMsg} onChangeText={setCounterMsg} />
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Button label="Cancelar" variant="outline" onPress={() => setShowCounterForm(false)} />
              <Button label="Enviar" onPress={handleCounter} loading={sendOffer.isPending} />
            </View>
          </MotiView>
        )}

        {canRespond && !showCounterForm && (
          <View style={styles.actionsRow}>
            <Button label="Recusar" variant="outline" onPress={handleReject} fullWidth={false} style={{ flex: 1 }} />
            <Button label="Contrapropor" variant="secondary" onPress={openCounterForm} fullWidth={false} style={{ flex: 1 }} />
            <Button label="Aceitar" onPress={handleAccept} loading={sendOffer.isPending} fullWidth={false} style={{ flex: 1 }} />
          </View>
        )}

        {negotiation.status === "ABERTA" && (
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Escrever mensagem..."
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
              style={styles.chatInput}
              multiline
            />
            <Pressable onPress={handleSendMessage} style={styles.sendBtn}>
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.sm,
    },
    headerName: { ...typography.bodyMedium, color: colors.textPrimary },
    headerListing: { ...typography.caption, color: colors.textSecondary },
    dealLink: { backgroundColor: colors.primaryLight, paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radius.full },
    dealLinkText: { ...typography.small, color: colors.primaryDark, fontFamily: typography.captionMedium.fontFamily },
    messages: { padding: spacing.lg, gap: spacing.sm },
    bubbleMine: { alignSelf: "flex-end", backgroundColor: colors.primary },
    bubbleTheirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
    offerBubble: { maxWidth: "80%", borderRadius: radius.lg, padding: spacing.md },
    offerLabel: { ...typography.captionMedium, color: colors.textPrimary },
    offerDetail: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
    offerMessage: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
    messageBubble: { maxWidth: "80%", borderRadius: radius.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
    messageText: { ...typography.body, color: colors.textPrimary },
    error: { ...typography.caption, color: colors.danger, textAlign: "center", marginBottom: spacing.sm },
    counterForm: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
    actionsRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    chatInput: {
      flex: 1,
      maxHeight: 100,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
  });
