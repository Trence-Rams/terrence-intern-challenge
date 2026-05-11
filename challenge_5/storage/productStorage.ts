import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  totalSold: number;
  dailySold: number;
}

const STORAGE_KEY = "spaza_products";
const GRAND_TOTAL_KEY = "spaza_grand_total";
const GRAND_DAILY_KEY = "spaza_grand_daily";
const GRAND_PROFIT_KEY = "spaza_grand_profit";
const GRAND_DAILY_PROFIT_KEY = "spaza_grand_daily_profit";

export const getProducts = async (): Promise<Product[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const products = JSON.parse(data);
    return products.map((p: any) => ({
      ...p,
      cost: p.cost ?? 0,
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

export const getGrandTotal = async (): Promise<{
  revenue: number;
  sold: number;
  profit: number;
  dailyRevenue: number;
  dailySold: number;
  dailyProfit: number;
}> => {
  try {
    const rev = await AsyncStorage.getItem(GRAND_TOTAL_KEY);
    const daily = await AsyncStorage.getItem(GRAND_DAILY_KEY);
    const profit = await AsyncStorage.getItem(GRAND_PROFIT_KEY);
    const dailyProfit = await AsyncStorage.getItem(GRAND_DAILY_PROFIT_KEY);

    const parsedRev = rev ? JSON.parse(rev) : { revenue: 0, sold: 0 };
    const parsedDaily = daily ? JSON.parse(daily) : { revenue: 0, sold: 0 };
    const parsedProfit = profit ? JSON.parse(profit) : { profit: 0 };
    const parsedDailyProfit = dailyProfit
      ? JSON.parse(dailyProfit)
      : { profit: 0 };

    return {
      revenue: parsedRev.revenue ?? 0,
      sold: parsedRev.sold ?? 0,
      profit: parsedProfit.profit ?? 0,
      dailyRevenue: parsedDaily.revenue ?? 0,
      dailySold: parsedDaily.sold ?? 0,
      dailyProfit: parsedDailyProfit.profit ?? 0,
    };
  } catch {
    return {
      revenue: 0,
      sold: 0,
      profit: 0,
      dailyRevenue: 0,
      dailySold: 0,
      dailyProfit: 0,
    };
  }
};

const incrementGrandTotal = async (
  price: number,
  cost: number,
): Promise<void> => {
  const profit = price - cost;
  const totals = await getGrandTotal();

  await AsyncStorage.setItem(
    GRAND_TOTAL_KEY,
    JSON.stringify({
      revenue: totals.revenue + price,
      sold: totals.sold + 1,
    }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_KEY,
    JSON.stringify({
      revenue: totals.dailyRevenue + price,
      sold: totals.dailySold + 1,
    }),
  );
  await AsyncStorage.setItem(
    GRAND_PROFIT_KEY,
    JSON.stringify({
      profit: totals.profit + profit,
    }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_PROFIT_KEY,
    JSON.stringify({
      profit: totals.dailyProfit + profit,
    }),
  );
};

const decrementGrandTotal = async (
  price: number,
  cost: number,
): Promise<void> => {
  const profit = price - cost;
  const totals = await getGrandTotal();

  await AsyncStorage.setItem(
    GRAND_TOTAL_KEY,
    JSON.stringify({
      revenue: Math.max(0, totals.revenue - price),
      sold: Math.max(0, totals.sold - 1),
    }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_KEY,
    JSON.stringify({
      revenue: Math.max(0, totals.dailyRevenue - price),
      sold: Math.max(0, totals.dailySold - 1),
    }),
  );
  await AsyncStorage.setItem(
    GRAND_PROFIT_KEY,
    JSON.stringify({
      profit: Math.max(0, totals.profit - profit),
    }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_PROFIT_KEY,
    JSON.stringify({
      profit: Math.max(0, totals.dailyProfit - profit),
    }),
  );
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
    await incrementGrandTotal(products[index].price, products[index].cost);
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
    await decrementGrandTotal(products[index].price, products[index].cost);
    await saveProducts(products);
  }
};

export const resetDay = async (): Promise<void> => {
  const products = await getProducts();
  const reset = products.map((p) => ({ ...p, dailySold: 0 }));
  await saveProducts(reset);
  await AsyncStorage.setItem(
    GRAND_DAILY_KEY,
    JSON.stringify({ revenue: 0, sold: 0 }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_PROFIT_KEY,
    JSON.stringify({ profit: 0 }),
  );
};

export const resetAll = async (): Promise<void> => {
  const products = await getProducts();
  const reset = products.map((p) => ({ ...p, dailySold: 0, totalSold: 0 }));
  await saveProducts(reset);
  await AsyncStorage.setItem(
    GRAND_TOTAL_KEY,
    JSON.stringify({ revenue: 0, sold: 0 }),
  );
  await AsyncStorage.setItem(
    GRAND_DAILY_KEY,
    JSON.stringify({ revenue: 0, sold: 0 }),
  );
  await AsyncStorage.setItem(GRAND_PROFIT_KEY, JSON.stringify({ profit: 0 }));
  await AsyncStorage.setItem(
    GRAND_DAILY_PROFIT_KEY,
    JSON.stringify({ profit: 0 }),
  );
};
