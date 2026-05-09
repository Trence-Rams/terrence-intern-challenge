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
import { getGrandTotal, resetDay } from "../storage/productStorage";

export default function SummaryScreen() {
  const [grandTotal, setGrandTotal] = React.useState({
    revenue: 0,
    sold: 0,
    dailyRevenue: 0,
    dailySold: 0,
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

  const handleResetDay = () => {
    Alert.alert(
      "Reset Day",
      "This will clear today's sales. All time totals will stay. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetDay();
            await loadTotals();
          },
        },
      ],
    );
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
          <Text style={styles.statLabel}>Items Today</Text>
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
          <Text style={styles.statLabel}>Items Sold</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={handleResetDay}>
        <Text style={styles.resetBtnText}>Reset Day</Text>
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
