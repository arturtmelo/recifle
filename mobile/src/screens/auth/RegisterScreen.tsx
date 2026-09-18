import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AuthStackParamList } from "../../navigation/types";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { useLocation } from "../../hooks/useLocation";
import { radius, spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";
import { Role } from "../../types";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const ROLE_OPTIONS: { role: Role; title: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  {
    role: "POPULACAO",
    title: "População",
    description: "Quero doar ou vender material reciclável de casa",
    icon: "home-outline",
  },
  {
    role: "FORNECEDOR",
    title: "Fornecedor",
    description: "Represento uma empresa com material reciclável",
    icon: "domain",
  },
  {
    role: "CENTRO",
    title: "Centro de Reciclagem",
    description: "Recebo e negocio materiais recicláveis",
    icon: "factory",
  },
];

export function RegisterScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { register } = useAuth();
  const { coords } = useLocation();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [addressText, setAddressText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!role) return;
    setError(null);
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
        addressText: addressText.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      });
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível criar sua conta."));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!role && name.length > 1 && email.includes("@") && password.length >= 6;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Como você vai usar o ReciCla?</Text>

        <View style={styles.roles}>
          {ROLE_OPTIONS.map((option) => {
            const selected = role === option.role;
            return (
              <Pressable
                key={option.role}
                onPress={() => setRole(option.role)}
                style={[styles.roleCard, selected && styles.roleCardSelected]}
              >
                <View style={[styles.roleIcon, selected && { backgroundColor: colors.primary }]}>
                  <MaterialCommunityIcons name={option.icon} size={22} color={selected ? colors.white : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleTitle}>{option.title}</Text>
                  <Text style={styles.roleDescription}>{option.description}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>

        {role && (
          <View style={{ marginTop: spacing.lg }}>
            <Input label="Nome" placeholder={role === "POPULACAO" ? "Seu nome" : "Nome da organização"} value={name} onChangeText={setName} />
            <Input label="E-mail" placeholder="voce@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <Input label="Telefone (opcional)" placeholder="(11) 90000-0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <Input label="Endereço (opcional)" placeholder="Rua, número, bairro" value={addressText} onChangeText={setAddressText} />
            <Input label="Senha" placeholder="Mínimo 6 caracteres" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {role && <Button label="Criar conta" onPress={handleSubmit} loading={loading} disabled={!canSubmit} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.xl, paddingTop: 60, flexGrow: 1 },
    backBtn: { marginBottom: spacing.lg },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
    roles: { gap: spacing.md },
    roleCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    roleCardSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
    roleIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    roleTitle: { ...typography.bodyMedium, color: colors.textPrimary },
    roleDescription: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
  });
