import React, { useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View, ViewToken } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MotiView } from "moti";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { Button } from "../../components/Button";
import { spacing, typography, ThemeColors } from "../../theme";
import { useThemeColors } from "../../theme/ThemeContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "recycle-variant" as const,
    title: "Bem-vindo ao ReciCla",
    description: "Conectamos centros de reciclagem, fornecedores e população em um só lugar.",
  },
  {
    icon: "camera-outline" as const,
    title: "Publique seu material",
    description: "Anuncie o que você quer doar ou vender, com fotos, quantidade e localização.",
  },
  {
    icon: "handshake-outline" as const,
    title: "Negocie em tempo real",
    description: "Proponha, converse e feche negócios direto no chat, sem intermediários.",
  },
  {
    icon: "chart-line" as const,
    title: "Acompanhe seu impacto",
    description: "Veja quantos kg você já reciclou e suba de nível conforme recicla mais.",
  },
];

export function WelcomeScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const isLast = activeIndex === SLIDES.length - 1;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActiveIndex(viewableItems[0].index);
  }).current;

  const goNext = () => {
    if (isLast) return;
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.container}>
      <Pressable onPress={() => navigation.navigate("Login")} style={styles.skipBtn} hitSlop={12}>
        <Text style={styles.skipText}>Pular</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.title}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width }]}>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 450 }}
              style={styles.logoWrap}
            >
              <MaterialCommunityIcons name={item.icon} size={48} color={colors.white} />
            </MotiView>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.bottom}>
        {isLast ? (
          <>
            <Button label="Criar conta" onPress={() => navigation.navigate("Register")} variant="secondary" />
            <Button
              label="Já tenho conta"
              onPress={() => navigation.navigate("Login")}
              variant="ghost"
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <Button label="Próximo" onPress={goNext} variant="secondary" />
        )}
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, paddingTop: 60, paddingBottom: spacing.xxl },
    skipBtn: { alignSelf: "flex-end", paddingHorizontal: spacing.xl, marginBottom: spacing.md },
    skipText: { ...typography.bodyMedium, color: "rgba(255,255,255,0.85)" },
    slide: { alignItems: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
    logoWrap: {
      width: 96,
      height: 96,
      borderRadius: 28,
      backgroundColor: "rgba(255,255,255,0.16)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xl,
    },
    title: { ...typography.h1, color: colors.white, fontSize: 28, textAlign: "center" },
    subtitle: {
      ...typography.body,
      color: "rgba(255,255,255,0.85)",
      marginTop: spacing.md,
      textAlign: "center",
      maxWidth: 300,
    },
    dots: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginVertical: spacing.xl },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.35)" },
    dotActive: { backgroundColor: colors.white, width: 22 },
    bottom: { paddingHorizontal: spacing.xl },
  });
