import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MotiView } from "moti";
import { ScreenContainer } from "../../components/ScreenContainer";
import { PhotoCarousel } from "../../components/PhotoCarousel";
import { MaterialChip, Badge } from "../../components/Chip";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { FavoriteButton } from "../../components/FavoriteButton";
import { useListing, useUpdateListingStatus } from "../../hooks/useListings";
import { useStartNegotiation } from "../../hooks/useNegotiations";
import { useAuth } from "../../store/AuthContext";
import { useToast } from "../../store/ToastContext";
import { getErrorMessage } from "../../services/api";
import { ecoLevelColors, radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { materialInfo, MaterialType } from "../../theme/materials";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "ListingDetail">;

export function ListingDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { id } = route.params;
  const { user } = useAuth();
  const { show } = useToast();
  const listingQuery = useListing(id);
  const startNegotiation = useStartNegotiation();
  const updateStatus = useUpdateListingStatus();

  const [showProposalForm, setShowProposalForm] = useState(false);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const listing = listingQuery.data;
  if (!listing) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  const info = materialInfo[listing.materialType as MaterialType] ?? materialInfo.OUTROS;
  const isOwner = listing.owner?.id === user?.id;

  const openProposalForm = () => {
    setQuantity(String(listing.quantityKg));
    setPrice(listing.pricePerKg ? String(listing.pricePerKg) : "");
    setShowProposalForm(true);
  };

  const handleSendProposal = async () => {
    setError(null);
    try {
      const negotiation = await startNegotiation.mutateAsync({
        listingId: listing.id,
        pricePerKg: price ? Number(price) : undefined,
        quantityKg: Number(quantity),
        message: message.trim() || undefined,
      });
      show("Proposta enviada!", "success");
      navigation.replace("NegotiationDetail", { id: negotiation.id });
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível enviar a proposta."));
    }
  };

  const handleCancelListing = async () => {
    await updateStatus.mutateAsync({ id: listing.id, status: "CANCELADO" });
    show("Anúncio cancelado.", "info");
    navigation.goBack();
  };

  return (
    <ScreenContainer edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          {!isOwner && <FavoriteButton targetType="LISTING" targetId={id} />}
        </View>

        <PhotoCarousel photos={listing.photos} materialType={listing.materialType as MaterialType} />

        <View style={styles.tagsRow}>
          <MaterialChip type={listing.materialType as MaterialType} />
          {listing.priceType === "DOACAO" ? (
            <Badge label="Doação" color={colors.accent} />
          ) : (
            <Badge label={`R$ ${listing.pricePerKg?.toFixed(2)}/kg`} color={colors.textPrimary} />
          )}
          <Badge label={listing.status.replace("_", " ")} color={colors.info} />
        </View>

        <Text style={styles.title}>{listing.title}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="scale-bathroom" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{listing.quantityKg} kg disponíveis</Text>
          {listing.distanceKm !== undefined && (
            <>
              <View style={styles.dotSep} />
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>{listing.distanceKm} km de você</Text>
            </>
          )}
        </View>

        {!!listing.description && <Text style={styles.description}>{listing.description}</Text>}
        {!!listing.addressText && (
          <View style={styles.addressBox}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.addressText}>{listing.addressText}</Text>
          </View>
        )}

        {listing.owner && (
          <View style={styles.ownerCard}>
            <Avatar name={listing.owner.name} url={listing.owner.avatarUrl} size={48} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.ownerName}>{listing.owner.name}</Text>
              <Text style={[styles.ownerLevel, { color: ecoLevelColors[listing.owner.ecoLevel] }]}>
                Nível {listing.owner.ecoLevel} · {listing.owner.dealsCompleted} negócios
              </Text>
            </View>
          </View>
        )}

        {showProposalForm && !isOwner && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.proposalForm}
          >
            <Text style={styles.proposalTitle}>Enviar proposta</Text>
            <Input label="Quantidade desejada (kg)" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
            <Input label="Preço por kg (R$, opcional para doação)" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
            <Input label="Mensagem (opcional)" placeholder="Combine detalhes da coleta" value={message} onChangeText={setMessage} />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Button label="Enviar proposta" onPress={handleSendProposal} loading={startNegotiation.isPending} />
          </MotiView>
        )}
      </ScrollView>

      {!isOwner && listing.status === "DISPONIVEL" && !showProposalForm && (
        <View style={styles.footer}>
          <Button label="Fazer proposta" onPress={openProposalForm} icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.white} />} />
        </View>
      )}

      {isOwner && listing.status === "DISPONIVEL" && (
        <View style={styles.footer}>
          <Button label="Cancelar anúncio" variant="danger" onPress={handleCancelListing} loading={updateStatus.isPending} />
        </View>
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    tagsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, flexWrap: "wrap" },
    title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md },
    metaRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, gap: 4 },
    metaText: { ...typography.caption, color: colors.textSecondary },
    dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.border, marginHorizontal: 6 },
    description: { ...typography.body, color: colors.textPrimary, marginTop: spacing.lg },
    addressBox: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.md },
    addressText: { ...typography.caption, color: colors.textSecondary, flex: 1 },
    ownerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.xl,
    },
    ownerName: { ...typography.bodyMedium, color: colors.textPrimary },
    ownerLevel: { ...typography.caption, marginTop: 2 },
    proposalForm: {
      marginTop: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    proposalTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
  });
