import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { radius, spacing, typography, ThemeColors } from "../theme";
import { useThemeColors } from "../theme/ThemeContext";
import { Deal } from "../types";

const MONTHS_BACK = 6;
const CHART_HEIGHT = 120;
const BAR_GAP = 12;

export function ImpactChart({ deals }: { deals: Deal[] }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const months = useMemo(() => {
    const now = startOfMonth(new Date());
    return Array.from({ length: MONTHS_BACK }, (_, i) => subMonths(now, MONTHS_BACK - 1 - i));
  }, []);

  const values = useMemo(() => {
    return months.map((month) => {
      const monthKey = format(month, "yyyy-MM");
      return deals
        .filter((d) => d.status === "CONCLUIDO" && d.completedAt && format(new Date(d.completedAt), "yyyy-MM") === monthKey)
        .reduce((sum, d) => sum + d.finalQuantityKg, 0);
    });
  }, [deals, months]);

  const total = values.reduce((sum, v) => sum + v, 0);
  const max = Math.max(...values, 1);

  if (total === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Seus negócios concluídos vão aparecer aqui, mês a mês.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.chartRow}>
        {months.map((month, i) => {
          const value = values[i];
          const barHeight = Math.max((value / max) * CHART_HEIGHT, value > 0 ? 6 : 2);
          return (
            <View key={month.toISOString()} style={styles.barColumn}>
              {value > 0 && <Text style={styles.barValue}>{value % 1 === 0 ? value : value.toFixed(1)}</Text>}
              <Svg width={24} height={CHART_HEIGHT} style={{ marginTop: value > 0 ? 0 : 16 }}>
                <Rect
                  x={0}
                  y={CHART_HEIGHT - barHeight}
                  width={24}
                  height={barHeight}
                  rx={4}
                  fill={i === months.length - 1 ? colors.primary : `${colors.primary}99`}
                />
              </Svg>
              <Text style={styles.barLabel}>{format(month, "MMM", { locale: ptBR }).replace(".", "")}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: BAR_GAP,
    },
    barColumn: { alignItems: "center", flex: 1 },
    barValue: { ...typography.small, color: colors.textSecondary, marginBottom: 4 },
    barLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs, textTransform: "capitalize" },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyText: { ...typography.caption, color: colors.textSecondary, textAlign: "center" },
  });
