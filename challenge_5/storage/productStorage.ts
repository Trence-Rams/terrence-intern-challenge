import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  totalSold: number;
  dailySold: number;
}

const STORAGE_KEY = "spaza_products";

export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const products = JSON.parse(data);
    return products.map((p: any) => ({
      ...p,
      dailySold: p.dailySold ?? 0,
    }));
  } catch {
    return [];
  }
};

export const saveProducts = async (products: Product[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    console.error("Failed to save products");
  }
};

export const addProduct = async (
  product: Omit<Product, "id" | "totalSold" | "dailySold">,
): Promise<void> => {
  const products = await getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    totalSold: 0,
    dailySold: 0,
  };
  await saveProducts([...products, newProduct]);
};

export const updateProduct = async (updated: Product): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === updated.id);
  if (index !== -1) {
    products[index] = updated;
    await saveProducts(products);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
};

export const sellProduct = async (id: string): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1 && products[index].stock > 0) {
    products[index].stock -= 1;
    products[index].totalSold += 1;
    products[index].dailySold += 1;
    await saveProducts(products);
  }
};

export const undoSell = async (id: string): Promise<void> => {
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1 && products[index].totalSold > 0) {
    products[index].stock += 1;
    products[index].totalSold -= 1;
    products[index].dailySold = Math.max(0, products[index].dailySold - 1);
    await saveProducts(products);
  }
};

export const resetDay = async (): Promise<void> => {
  const products = await getProducts();
  const reset = products.map((p) => ({ ...p, dailySold: 0 }));
  await saveProducts(reset);
};
