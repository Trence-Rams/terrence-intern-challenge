import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing } from "../constants/theme";
import { getGrandTotal, resetAll, resetDay } from "../storage/productStorage";

export default function SummaryScreen() {
  const [grandTotal, setGrandTotal] = React.useState({
    revenue: 0,
    sold: 0,
    profit: 0,
    dailyRevenue: 0,
    dailySold: 0,
    dailyProfit: 0,
  });
  const insets = useSafeAreaInsets();

  const loadTotals = async () => {
    const totals = await getGrandTotal();
    setGrandTotal(totals);
  };

  useFocusEffect(
    useCallback(() => {
      loadTotals();
    }, []),
  );

  const handleReset = () => {
    Alert.alert("Reset", "What would you like to reset?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset Today",
        onPress: async () => {
          await resetDay();
          await loadTotals();
        },
      },
      {
        text: "Reset All Time",
        style: "destructive",
        onPress: async () => {
          await resetAll();
          await loadTotals();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <Text style={styles.sectionTitle}>Today</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            R{grandTotal.dailyRevenue.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{grandTotal.dailySold}</Text>
          <Text style={styles.statLabel}>Items Sold</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardProfit]}>
          <Text style={styles.statValue}>
            R{grandTotal.dailyProfit.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Today's Profit</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Time</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardDim]}>
          <Text style={styles.statValue}>R{grandTotal.revenue.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDim]}>
          <Text style={styles.statValue}>{grandTotal.sold}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            styles.statCardDim,
            styles.statCardProfitDim,
          ]}
        >
          <Text style={styles.statValue}>R{grandTotal.profit.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Profit</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetBtnText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: "center",
    elevation: 2,
  },
  statCardDim: {
    backgroundColor: Colors.border,
  },
  statCardProfit: {
    backgroundColor: "#4CAF50",
  },
  statCardProfitDim: {
    backgroundColor: "#81C784",
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginTop: Spacing.xs,
    fontWeight: "600",
  },
  resetBtn: {
    position: "absolute",
    bottom: 24,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.stockLow,
    padding: Spacing.md,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },
  resetBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
});
