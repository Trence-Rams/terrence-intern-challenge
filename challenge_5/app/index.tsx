import { useFocusEffect } from "expo-router";
import { Search, ShoppingCart, X } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProductCard from "../components/ProductCard";
import { Colors, FontSize, Spacing } from "../constants/theme";
import {
  Product,
  getProducts,
  sellProduct,
  undoSell,
} from "../storage/productStorage";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SellScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartModal, setCartModal] = useState(false);
  const [amountGiven, setAmountGiven] = useState("");
  const insets = useSafeAreaInsets();

  const loadProducts = async () => {
    const data = await getProducts();
    const sorted = data.sort((a, b) => b.totalSold - a.totalSold);
    setProducts(sorted);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const handleSell = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.stock <= 0) return;
    await sellProduct(id);
    await loadProducts();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleUndo = async (id: string) => {
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return; // Not in cart, do nothing

    await undoSell(id);
    await loadProducts();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((item) => item.id !== id);
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
  };

  const handleCancelSale = async () => {
    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        await undoSell(item.id);
      }
    }
    await loadProducts();
    setCart([]);
    setAmountGiven("");
    setCartModal(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const change = parseFloat(amountGiven) - cartTotal;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (products.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>No products yet</Text>
        <Text style={styles.emptySubtitle}>
          Go to Manage to add your first product
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello Mama 👋</Text>
          <Text style={styles.subGreeting}>
            {products.length} products in your shop
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => {
            setAmountGiven("");
            setCartModal(true);
          }}
          onLongPress={() => {
            if (cart.length > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setCart([]);
              setAmountGiven("");
            }
          }}
          delayLongPress={500}
        >
          <ShoppingCart size={22} color={Colors.text} />
          {cartTotal > 0 && (
            <Text style={styles.cartTotal}>R{cartTotal.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <Search size={18} color={Colors.textLight} />
        <TextInput
          style={styles.search}
          placeholder="Search products..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No products match "{search}"</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onSell={handleSell}
              onUndo={handleUndo}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.grid}
        />
      )}

      {/* Cart Modal */}
      <Modal
        visible={cartModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Current Sale</Text>
              <TouchableOpacity onPress={() => setCartModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <Text style={styles.emptyCartText}>No items added yet</Text>
            ) : (
              <ScrollView style={styles.cartList}>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartRow}>
                    <Text style={styles.cartItemName}>
                      {item.name} x{item.quantity}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      R{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>R{cartTotal.toFixed(2)}</Text>
                </View>
              </ScrollView>
            )}

            {cart.length > 0 && (
              <>
                <Text style={styles.label}>Amount received (R)</Text>
                <TextInput
                  style={styles.input}
                  value={amountGiven}
                  onChangeText={setAmountGiven}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.textLight}
                />
                {amountGiven !== "" && (
                  <View style={styles.changeRow}>
                    <Text style={styles.changeLabel}>Change</Text>
                    <Text
                      style={[
                        styles.changeValue,
                        {
                          color: change >= 0 ? Colors.stockOk : Colors.stockLow,
                        },
                      ]}
                    >
                      {change >= 0 ? `R${change.toFixed(2)}` : "Not enough"}
                    </Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setCart([]);
                setAmountGiven("");
                setCartModal(false);
              }}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>

            {cart.length > 0 && (
              <TouchableOpacity
                style={styles.cancelSaleBtn}
                onPress={handleCancelSale}
              >
                <Text style={styles.cancelSaleBtnText}>Cancel Sale</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
    color: Colors.primary,
  },
  subGreeting: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  cartBtn: {
    alignItems: "flex-end",
  },
  cartTotal: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: 30,
    paddingHorizontal: Spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  search: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  grid: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyCartText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  cartList: {
    maxHeight: 200,
    marginBottom: Spacing.md,
  },
  cartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cartItemName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: "500",
  },
  cartItemPrice: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.text,
  },
  totalValue: {
    fontSize: FontSize.lg,
    fontWeight: "bold",
    color: Colors.text,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  changeLabel: {
    fontSize: FontSize.lg,
    fontWeight: "600",
    color: Colors.text,
  },
  changeValue: {
    fontSize: FontSize.xxl,
    fontWeight: "bold",
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  doneBtnText: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  cancelSaleBtn: {
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.stockLow,
  },
  cancelSaleBtnText: {
    color: Colors.stockLow,
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
