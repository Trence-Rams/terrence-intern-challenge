import { useFocusEffect } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

export default function SellScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
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
    await sellProduct(id);
    await loadProducts();
  };

  const handleUndo = async (id: string) => {
    await undoSell(id);
    await loadProducts();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
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
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello Mama 👋</Text>
        <Text style={styles.subGreeting}>
          {products.length === 1
            ? `${products.length} product`
            : `${products.length} products`}{" "}
          in your shop
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  search: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
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
  grid: {
    paddingHorizontal: Spacing.sm,
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
});
