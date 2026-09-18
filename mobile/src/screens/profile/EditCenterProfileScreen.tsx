import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { MaterialChip } from "../../components/Chip";
import { useUpdateMyCenter } from "../../hooks/useCenters";
import { useAuth } from "../../store/AuthContext";
import { useToast } from "../../store/ToastContext";
import { getErrorMessage } from "../../services/api";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { MATERIAL_TYPES, MaterialType } from "../../theme/materials";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "EditCenterProfile">;

export function EditCenterProfileScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, refreshUser } = useAuth();
  const { show } = useToast();
  const updateCenter = useUpdateMyCenter();

  const [description, setDescription] = useState(user?.centerProfile?.description ?? "");
  const [openingHours, setOpeningHours] = useState(user?.centerProfile?.openingHours ?? "");
  const [addressText, setAddressText] = useState(user?.addressText ?? "");
  const [materials, setMaterials] = useState<MaterialType[]>((user?.centerProfile?.materials ?? []) as MaterialType[]);
  const [error, setError] = useState<string | null>(null);

  const toggleMaterial = (type: MaterialType) => {
    setMaterials((prev) => (prev.includes(type) ? prev.filter((m) => m !== type) : [...prev, type]));
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateCenter.mutateAsync({ description, openingHours, materials, addressText });
      await refreshUser();
      show("Perfil atualizado!", "success");
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível salvar as alterações."));
    }
  };

  return (
    <ScreenContainer edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Perfil do centro</Text>
        <Text style={styles.subtitle}>Essas informações aparecem para quem busca onde reciclar.</Text>

        <Input label="Descrição" placeholder="Conte sobre o seu centro" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top" }} />
        <Input label="Horário de funcionamento" placeholder="Ex: Seg-Sex, 8h às 18h" value={openingHours} onChangeText={setOpeningHours} />
        <Input label="Endereço" placeholder="Rua, número, bairro" value={addressText} onChangeText={setAddressText} />

        <Text style={styles.label}>Materiais aceitos</Text>
        <View style={styles.chipsWrap}>
          {MATERIAL_TYPES.map((type) => (
            <MaterialChip key={type} type={type} selected={materials.includes(type)} onPress={() => toggleMaterial(type)} />
          ))}
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button label="Salvar alterações" onPress={handleSave} loading={updateCenter.isPending} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    label: { ...typography.captionMedium, color: colors.textSecondary, marginBottom: spacing.sm },
    chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    error: { ...typography.caption, color: colors.danger, marginTop: spacing.md },
  });
