import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, FontSize, Spacing } from "../constants/theme";
import { Product } from "../storage/productStorage";

interface Props {
  product: Product;
  onSell: (id: string) => void;
  onUndo: (id: string) => void;
}

export default function ProductCard({ product, onSell, onUndo }: Props) {
  const isLowStock = product.stock <= product.lowStockThreshold;
  //update the
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSell(product.id);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onUndo(product.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: isLowStock ? Colors.stockLow : Colors.stockOk },
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>

      <View style={styles.bottom}>
        <Text style={styles.price}>R{product.price.toFixed(2)}</Text>
        <View
          style={[
            styles.stockBadge,
            { backgroundColor: isLowStock ? "#FFF0F0" : "#F0FFF4" },
          ]}
        >
          <Text
            style={[
              styles.stockText,
              { color: isLowStock ? Colors.stockLow : Colors.stockOk },
            ]}
          >
            {product.stock} left
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    padding: Spacing.md,
    margin: Spacing.sm,
    width: "44%",
    minHeight: 130,
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  price: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontWeight: "500",
  },
  stockBadge: {
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  stockText: {
    fontSize: FontSize.sm,
    fontWeight: "800",
  },
});
