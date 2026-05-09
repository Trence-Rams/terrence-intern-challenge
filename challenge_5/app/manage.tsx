import { useFocusEffect } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSize, Spacing } from "../constants/theme";
import {
  Product,
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../storage/productStorage";

export default function ManageScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("5");

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setThreshold("5");
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setThreshold(product.lowStockThreshold.toString());
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }

    if (editingProduct) {
      await updateProduct({
        ...editingProduct,
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        lowStockThreshold: parseInt(threshold),
      });
    } else {
      await addProduct({
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        lowStockThreshold: parseInt(threshold),
      });
    }

    await loadProducts();
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteProduct(product.id);
            await loadProducts();
          },
        },
      ],
    );
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {filtered.length != 0 && (
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
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDetail}>
                R{item.price.toFixed(2)} · Stock: {item.stock} · Low at:{" "}
                {item.lowStockThreshold}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search
                ? `No products match "${search}"`
                : "No products yet. Tap + to add one."}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingProduct ? "Edit Product" : "Add Product"}
              </Text>

              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Bread"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.label}>Price (R)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 14.99"
                placeholderTextColor={Colors.textLight}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Current Stock</Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                placeholder="e.g. 20"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />

              <Text style={styles.label}>Low Stock Alert At</Text>
              <TextInput
                style={styles.input}
                value={threshold}
                onChangeText={setThreshold}
                placeholder="e.g. 5"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editingProduct ? "Save Changes" : "Add Product"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
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
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  row: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  productDetail: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  editBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },

  editBtnText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  deleteBtn: {
    backgroundColor: Colors.stockLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
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
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.lg,
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
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: Spacing.md,
    borderRadius: 10,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  cancelBtnText: {
    color: Colors.textLight,
    fontSize: FontSize.md,
  },
});
