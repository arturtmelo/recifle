import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AuthStackParamList } from "../../navigation/types";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { useAuth } from "../../store/AuthContext";
import { getErrorMessage } from "../../services/api";
import { spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(getErrorMessage(e, "Não foi possível entrar. Verifique seus dados."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre para continuar reciclando com propósito.</Text>

        <View style={{ marginTop: spacing.xl }}>
          <Input
            label="E-mail"
            placeholder="voce@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />
          <Input
            label="Senha"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button label="Entrar" onPress={handleSubmit} loading={loading} disabled={!email || !password} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
            {" "}
            Criar conta
          </Text>
        </View>

        <Text style={styles.demoHint}>
          Dica: use uma conta demo do seed, ex. centro1@reclicla.com / senha123
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.xl, paddingTop: 80, flexGrow: 1 },
    title: { ...typography.h1, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.md },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
    footerText: { ...typography.body, color: colors.textSecondary },
    link: { ...typography.bodyMedium, color: colors.primary },
    demoHint: { ...typography.small, color: colors.textMuted, textAlign: "center", marginTop: spacing.xxl },
  });
