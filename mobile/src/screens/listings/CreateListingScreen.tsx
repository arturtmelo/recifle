import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { MaterialChip } from "../../components/Chip";
import { useCreateListing } from "../../hooks/useListings";
import { useLocation } from "../../hooks/useLocation";
import { useToast } from "../../store/ToastContext";
import { getErrorMessage } from "../../services/api";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { MATERIAL_TYPES, MaterialType } from "../../theme/materials";
import { MainTabsParamList, RootStackParamList } from "../../navigation/types";
import { PriceType } from "../../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "CreateListing">,
  NativeStackScreenProps<RootStackParamList>
>;

export function CreateListingScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { coords } = useLocation();
  const { show } = useToast();
  const createListing = useCreateListing();

  const [materialType, setMaterialType] = useState<MaterialType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [priceType, setPriceType] = useState<PriceType>("DOACAO");
  const [pricePerKg, setPricePerKg] = useState("");
  const [addressText, setAddressText] = useState("");
  const [photos, setPhotos] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsMultipleSelection: true,
      selectionLimit: 6 - photos.length,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, i) => ({
        uri: asset.uri,
        name: `foto-${Date.now()}-${i}.jpg`,
        type: "image/jpeg",
      }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 6));
    }
  };

  const canSubmit = !!materialType && title.length > 2 && Number(quantityKg) > 0 && (priceType === "DOACAO" || Number(pricePerKg) > 0);

  const resetForm = () => {
    setMaterialType(null);
    setTitle("");
    setDescription("");
    setQuantityKg("");
    setPriceType("DOACAO");
    setPricePerKg("");
    setAddressText("");
    setPhotos([]);
  };

  const handleSubmit = async () => {
    if (!materialType) return;
    setError(null);
    try {
      await createListing.mutateAsync({
        materialType,
        title: title.trim(),
        description: description.trim() || undefined,
        quantityKg: Number(quantityKg),
        priceType,
        pricePerKg: priceType === "VENDA" ? Number(pricePerKg) : undefined,
        addressText: addressText.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
        photos,
      });
      resetForm();
      show("Anúncio publicado!", "success");
      navigation.navigate("Home");
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível publicar seu anúncio."));
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Criar anúncio</Text>
        <Text style={styles.subtitle}>Publique o material que você quer doar ou vender.</Text>

        <Text style={styles.label}>Tipo de material</Text>
        <View style={styles.chipsWrap}>
          {MATERIAL_TYPES.map((type) => (
            <MaterialChip key={type} type={type} selected={materialType === type} onPress={() => setMaterialType(type)} />
          ))}
        </View>

        <Input label="Título" placeholder="Ex: Garrafas PET limpas" value={title} onChangeText={setTitle} />
        <Input
          label="Descrição (opcional)"
          placeholder="Detalhes sobre o material, condição, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: "top" }}
        />
        <Input label="Quantidade (kg)" placeholder="Ex: 15" keyboardType="numeric" value={quantityKg} onChangeText={setQuantityKg} />

        <Text style={styles.label}>Tipo de negociação</Text>
        <View style={styles.priceToggle}>
          <Pressable
            onPress={() => setPriceType("DOACAO")}
            style={[styles.toggleOption, priceType === "DOACAO" && styles.toggleOptionActive]}
          >
            <Text style={[styles.toggleText, priceType === "DOACAO" && styles.toggleTextActive]}>Doação</Text>
          </Pressable>
          <Pressable
            onPress={() => setPriceType("VENDA")}
            style={[styles.toggleOption, priceType === "VENDA" && styles.toggleOptionActive]}
          >
            <Text style={[styles.toggleText, priceType === "VENDA" && styles.toggleTextActive]}>Venda</Text>
          </Pressable>
        </View>

        {priceType === "VENDA" && (
          <Input label="Preço por kg (R$)" placeholder="Ex: 0.50" keyboardType="decimal-pad" value={pricePerKg} onChangeText={setPricePerKg} />
        )}

        <Input
          label="Endereço de retirada (opcional)"
          placeholder="Rua, número, bairro"
          value={addressText}
          onChangeText={setAddressText}
        />

        <Text style={styles.label}>Fotos</Text>
        <View style={styles.photosRow}>
          {photos.map((photo, i) => (
            <View key={photo.uri} style={styles.photoThumb}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <Pressable
                style={styles.photoRemove}
                onPress={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <Ionicons name="close" size={12} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {photos.length < 6 && (
            <Pressable style={styles.addPhoto} onPress={pickImage}>
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button
          label="Publicar anúncio"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={createListing.isPending}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    label: { ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.sm },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
    priceToggle: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      padding: 4,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleOption: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
    toggleOptionActive: { backgroundColor: colors.primary },
    toggleText: { ...typography.captionMedium, color: colors.textSecondary },
    toggleTextActive: { color: colors.white },
    photosRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
    photoThumb: { width: 72, height: 72, borderRadius: radius.md, overflow: "hidden" },
    photoImage: { width: "100%", height: "100%" },
    photoRemove: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    addPhoto: {
      width: 72,
      height: 72,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  });
