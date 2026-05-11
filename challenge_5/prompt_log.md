me: i need to build a mobile app for a spaza shop owner called mama thandi. she uses a mid range android and her data is expensive. i want to build a react native expo app. remind me the setup

AI: mama thandi needs something simple, offline, and fast to use mid-sale.

for setup:

npx create-expo-app@latest SpazaShop
cd SpazaShop
node scripts/reset-project.js

choose y to move existing files to app-example. then run:

npx expo start

scan the QR code with Expo Go on your android phone.

me: npx create-expo-app gave me a lot of files i dont need. how do i clean it up

AI: run the reset script that expo provides:

node scripts/reset-project.js

it will ask you if you want to move existing files to /app-example instead of deleting them. type y.

after that you should only have:

app/
\_layout.tsx
index.tsx

that is your clean starting point.

me: i want asyncstorage for offline storage whats the exact install command for expo

AI: npx expo install @react-native-async-storage/async-storage

use npx expo install not npm install expo will automatically install the version compatible with your SDK version.

me: i created the storage file but typescript is complaining about the Product type on the Omit. here is my interface:

export interface Product {
id: string;
name: string;
price: number;
stock: number;
lowStockThreshold: number;
totalSold: number;
dailySold: number;
}

how do i fix the addProduct function

AI: the Omit on your addProduct function needs to exclude all the fields you generate automatically id, totalSold, and dailySold. use it like this:

export const addProduct = async (
product: Omit<Product, 'id' | 'totalSold' | 'dailySold'>
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

Date.now().toString() gives each product a unique id without needing a library.

me: useFocusEffect is not reloading my data when i switch tabs. here is my code:

useEffect(() => {
loadProducts();
}, []);

whats wrong

AI: useEffect with an empty array only runs once when the component mounts. it wont fire again when you switch tabs.

replace it with useFocusEffect from expo-router:

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

useFocusEffect(
useCallback(() => {
loadProducts();
}, [])
);

this runs every time the screen comes into focus. so when she switches from manage back to sell the grid reloads with the latest data.

me: my flatlist is not showing anything even though asyncstorage has data. here is my getProducts:

export const getProducts = async () => {
const data = await AsyncStorage.getItem(STORAGE_KEY);
return JSON.parse(data);
};

AI: two problems here.

first JSON.parse(null) throws an error when the key doesnt exist yet. second you have no return type so typescript cant infer the shape.

fix it like this:

export const getProducts = async (): Promise<Product[]> => {
try {
const data = await AsyncStorage.getItem(STORAGE_KEY);
return data ? JSON.parse(data) : [];
} catch {
return [];
}
};

the ternary checks if data exists before parsing. the try/catch handles any unexpected errors. and it always returns an array so flatlist never gets null.

me: how do i do long press on a touchableopacity. here is my current press handler:

<TouchableOpacity onPress={handleSell}>
  <Text>{product.name}</Text>
</TouchableOpacity>

AI: add onLongPress and delayLongPress props:

<TouchableOpacity
onPress={handleSell}
onLongPress={handleUndo}
delayLongPress={500}
activeOpacity={0.8}

> <Text>{product.name}</Text>
> </TouchableOpacity>

delayLongPress={500} means she has to hold for half a second before it triggers. prevents accidental undos when she just taps a bit slow.

also add haptic feedback so she feels the difference between a tap and a long press:

import \* as Haptics from 'expo-haptics';

const handleSell = () => {
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
onSell(product.id);
};

const handleUndo = () => {
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
onUndo(product.id);
};

light for sell, heavy for undo — she can feel which one fired without looking.

me: so the install command for haptics is npm install expo-haptics

AI: no use:

npx expo install expo-haptics

always use npx expo install for expo packages. it picks the version that matches your SDK. npm install might grab a version thats incompatible with your expo SDK and cause errors.

me: the long press undo is going above the initial stock amount. here is my undoSell:

export const undoSell = async (id: string): Promise<void> => {
const products = await getProducts();
const index = products.findIndex(p => p.id === id);
if (index !== -1) {
products[index].stock += 1;
products[index].totalSold -= 1;
await saveProducts(products);
}
};

AI: the problem is no guard. if totalSold is already 0 it still runs and goes negative on totalSold and above original stock.

add a check:

export const undoSell = async (id: string): Promise<void> => {
const products = await getProducts();
const index = products.findIndex(p => p.id === id);
if (index !== -1 && products[index].totalSold > 0) {
products[index].stock += 1;
products[index].totalSold -= 1;
products[index].dailySold = Math.max(0, products[index].dailySold - 1);
await saveProducts(products);
}
};

totalSold > 0 means you can only undo if something was actually sold. Math.max(0, ...) makes sure dailySold never goes negative either.

me: expo router tabs are overlapping the android nav bar but i have the SafeAreaView tag. how do i fix it. or is there another better solution

AI: SafeAreaView on the layout wont work properly with expo router tabs. use useSafeAreaInsets instead and apply it directly to the tab bar height:

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Layout() {
const insets = useSafeAreaInsets();

return (
<Tabs
screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom || 8,
        },
      }} >
</Tabs>
);
}

insets.bottom gives you the exact height of the android nav bar and adds it to the tab bar — works on every android device regardless of nav bar size.

me: my flatlist cards stretch when there is an odd number of products. here is my card style:

card: {
flex: 1,
backgroundColor: Colors.white,
borderRadius: 16,
borderWidth: 2,
padding: Spacing.md,
margin: Spacing.sm,
minHeight: 130,
},

AI: flex: 1 is the problem. when there is one card in a row it stretches to fill the full width.

replace flex: 1 with a fixed width:

card: {
backgroundColor: Colors.white,
borderRadius: 16,
borderWidth: 2,
padding: Spacing.md,
margin: Spacing.sm,
width: '44%',
minHeight: 130,
},

width: '44%' gives two cards per row with space between — the last card wont stretch when its alone.

me: isnt flex 1 used to make items to just flex and not the size

AI: flex: 1 in a flatlist with numColumns={2} means take up all remaining space in the row. so if there is only one card in the row it takes the full width.

width: '44%' is the right fix here because it gives each card a fixed proportion of the screen regardless of how many are in the row.

flex: 1 is useful when you want something to fill its parent container like making a screen take up full height. but for grid items fixed width is more predictable.

me: i added dailySold to my Product interface but old products in asyncstorage dont have it and its showing NaN on the summary screen of the emulator. here is the code:

export const getProducts = async (): Promise<Product[]> => {
try {
const data = await AsyncStorage.getItem(STORAGE_KEY);
return data ? JSON.parse(data) : [];
} catch {
return [];
}
};

AI: old products in asyncstorage were saved before you added dailySold so they dont have that field. when you do math on undefined you get NaN.

fix it in getProducts by defaulting missing fields:

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

?? 0 means if dailySold is undefined or null use 0 instead. this handles old data without you having to clear storage every time you add a new field.

me: actually i just reinstalled the expo go app instead

AI: that works too reinstalling clears the asyncstorage so all products start fresh with the correct shape.

the ?? 0 fix is still worth keeping though. if someone installs your app, uses it, then you push an update that adds a new field their data wont break. its defensive coding.

me: my modal is not sliding from the bottom. here is the code:

<Modal
visible={modalVisible}
animationType="slide"
transparent={false}
onRequestClose={() => setModalVisible(false)}

>   <View>

    <Text>Add Product</Text>

  </View>
</Modal>

AI: two problems.

transparent={false} means the modal takes up the full screen with no overlay it wont look like it slides from the bottom.

and the inner View has no positioning so it just fills the whole screen.

fix it like this:

<Modal
visible={modalVisible}
animationType="slide"
transparent={true}
onRequestClose={() => setModalVisible(false)}

>   <View style={styles.modalOverlay}>

    <View style={styles.modalContent}>
      <Text>Add Product</Text>
    </View>

  </View>
</Modal>

and the styles:

modalOverlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.5)',
justifyContent: 'flex-end',
},
modalContent: {
backgroundColor: Colors.white,
borderTopLeftRadius: 20,
borderTopRightRadius: 20,
padding: Spacing.lg,
maxHeight: '90%',
},

transparent={true} lets you see the dark overlay behind. justifyContent: 'flex-end' pushes the modal content to the bottom — borderTopLeftRadius and borderTopRightRadius give it that slide up sheet look.

me: i just realised that the status bar icons are not visible on my device. the background is now white. what caused that

AI: the default status bar style is light-content which means white icons. when your background changed to white the icons became invisible against it.

fix it by adding StatusBar to your screen:

import { StatusBar } from 'react-native';

// inside your return
<StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

dark-content switches the icons to dark so they show on a white background. add this to each screen.

me: i was thinking of having three stock states green, amber and red for the product cards. green for healthy, amber for getting low, red for critical

AI: that makes sense visually. amber would sit between green and red based on a calculated midpoint of the threshold.

me: actually amber adds unnecessary complexity. mama thandi would not know what amber means without explanation. green and red is enough she knows green is fine and red means reorder. lets remove amber

AI: agreed. two states is cleaner and more universally understood. green above threshold, red at or below.

me: i initially styled the product card with a left border only to show stock status. here is the style:

card: {
borderLeftWidth: 4,
borderLeftColor: isLowStock ? Colors.stockLow : Colors.stockOk,
}

AI: the left border highlights one side of the card which can feel unbalanced visually.

me: yes it does not clearly communicate stock status the way a full border would. a full border makes the whole card feel red or green which is more obvious at a glance especially when there is a queue and she is not looking carefully. change it to a full border

AI: updated to borderWidth: 2 with borderColor changing based on stock status. much clearer at a glance.

me: i was thinking of having a separate low stock alerts screen as a third tab so she can see all low stock products in one place

AI: that could work. it would show all products below their threshold in one list.

me: actually that adds an extra screen she has to navigate to. the card turning red on the sell screen already tells her which products are low while she is selling. she does not need to go anywhere else. remove the low stock screen and keep it to three tabs sell, manage, summary

AI: good call. the warning comes to her instead of her going to find it — one less screen to build and a better user experience.

me: i was thinking of having a favourites row at the top of the sell screen for her most used products. something like a pinned section

AI: a pinned section could help show her top 5 products as large buttons above the main grid.

me: that adds visual complexity and she would have to manage two separate lists. a better approach is to just order the entire grid by totalSold descending. her most sold products are always at the top automatically without any extra UI or management from her side

AI: that is cleaner. the grid self-organises based on actual sales data — no extra section, no extra work for her.

me: for the summary screen i was thinking of storing individual sale records with timestamps so i can filter by day

AI: that would work store each sale as a record with a productId, quantity and date field. then filter by today's date for daily stats.

me: that is overengineering it. i just need to add a dailySold field to the product and a reset button she taps at end of day. totalSold stays for all time. no need for individual records

AI: much simpler. one extra field, one function — achieves the same result without the complexity of storing and querying individual records.

me: i was thinking of adding a backup feature where she exports her data as json and whatsapps it to herself

AI: that would work well. expo-file-system and expo-sharing can handle the export. she taps backup, a json file saves to her phone, she shares it via whatsapp.

me: actually why are we building this. the brief never asked for it and mama thandi probably wont remember to use it consistently. it adds complexity for a feature she may never touch. lets drop it and i will mention it in the interview as something i considered and deliberately left out

AI: that is the right call. a deliberate decision not to build something is stronger than building something nobody uses.

me: for navigation i was considering swipe gestures between screens instead of a bottom tab bar. swiping feels more modern

AI: swipe navigation is more modern but has a real risk here. if she is on the sell screen and accidentally swipes while trying to tap a product card she navigates away mid-sale. with a queue of customers that is a problem.

me: yes and she uses whatsapp and facebook every day which both use bottom tab navigation. there is no learning curve if we use the same pattern. lets keep bottom tabs

AI: bottom tabs is the right call for this user.

me: i added a yellow header section at the top of the sell screen with a greeting and product count. but when i look at it on the phone it feels too heavy and takes up too much space. the sell screen should be about selling not greetings. how do i simplify it

AI: remove the full header section and just put the greeting text above the search bar. keeps the warmth without taking up real estate.

me: i tried that but now it still feels like extra noise on a screen that should be as clean as possible. i think the greeting should just be in the primary color as text, no background, no header block at all

AI: just render the greeting as a styled Text component with color: Colors.primary above the search bar. no View wrapper with background needed.

me: that works. now the screen feels clean and the greeting is still there without dominating

AI: good. less is more on the sell screen.

me: i built the summary screen with a search bar and a top 3 products list below the stats. but when i look at it the search and the product list feels like too much. the summary screen should just answer one question how did i do today

AI: agreed. the product breakdown and search can be removed. just show today stats, all time stats, and the reset button.

me: yes. the product breakdown is something i can mention in the interview as what i would add with more time. removing it now keeps the screen focused

AI: cleaner and more honest about what the screen is for.

me: i tried using SafeAreaView to fix the tab bar overlapping the android nav bar but it did not fix anything. the tabs were still overlapping

AI: SafeAreaView handles padding for the content inside a screen but it does not control the tab bar height in expo router. you need useSafeAreaInsets to manually add the bottom inset to the tab bar height.

me: okay that makes more sense. SafeAreaView just wraps content, it does not know about the tab bar. useSafeAreaInsets gives me the actual pixel values i can apply manually

AI: exactly. insets.bottom gives you the exact height of the android nav bar so you can add it to the tab bar height yourself.

me: i initially put the low stock threshold as a fixed value of 5 for all products. but different products have different reorder points. bread she reorders when she has 3 left, cold drinks maybe 10. it should be per product

AI: add lowStockThreshold as a field on the Product interface and let her set it when she adds or edits a product. default it to 5 in the form but she can change it.

me: yes that is better. a fixed threshold across all products does not reflect how a real shop works

me: i noticed that when i delete a product the summary totals drop because the reduce calculation loses that products totalSold. if mama thandi stops selling a product and deletes it she should not lose her sales history

AI: you need a separate grand total stored independently in asyncstorage that never gets affected by deletions. increment it on every sale, decrement on undo, never touch it on delete.

me: yes exactly. the grand total is just a running number that only ever changes when a sale happens or is undone. deleting a product does nothing to it

AI: added GRAND_TOTAL_KEY and GRAND_DAILY_KEY to asyncstorage. sellProduct increments both, undoSell decrements both, deleteProduct leaves them untouched. summary screen reads from grand totals not from product reduce.

me: i want the reset button on summary to give a choice between resetting today only or resetting all time. she might want to start fresh completely at some point

AI: show an Alert with three options: Cancel, Reset Today, Reset All Time. Reset Today clears dailySold and GRAND_DAILY_KEY. Reset All Time clears everything including totalSold on all products and both grand total keys.

me: that gives her the flexibility she needs without adding extra buttons to the screen

me: i was thinking about the selling flow. mama thandi sells multiple items to one customer. she needs to know the total and how much change to give. right now there is nothing tracking the current sale

AI: suggested a cart screen as a separate tab.

me: no a separate tab is too much navigation. it should be a cart icon in the top right of the sell screen. she taps each product as normal, the cart tracks the running total passively. she only opens the cart when she needs to calculate change or check the total

AI: that is a better approach. the cart works passively showing the running total on the icon. she opens it only when needed. most customers she just reads the total and never opens the modal at all.

me: exactly. and when she opens the cart she sees the items grouped by product with quantities, types the amount received, change shows instantly. done button clears the cart

AI: added CartItem interface with id, name, price, quantity. handleSell adds to cart and groups same products by incrementing quantity. cart total shows next to cart icon. modal shows grouped items, total, amount received input, change calculation.

me: what if the customer changes their mind after items were already sold

AI: suggested a confirm button before reducing stock.

me: no that breaks the 30 second interaction. the tap must still sell immediately. but inside the cart modal there should be a cancel sale button that loops through the cart and calls undoSell for each item quantity, restores all stock, and clears the cart

AI: cancel sale loops through cart items and calls undoSell item.quantity times for each product. stock is fully restored, grand totals are decremented, cart clears.
