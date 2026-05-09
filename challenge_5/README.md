# SpazaShop

A mobile app to help Mama Thandi run her spaza shop better.

## What I Built

Mama Thandi runs a spaza shop in Khayelitsha. She tracks everything in a notebook, runs out of stock without realising. I built her an app that solves those problems.

The app has three screens:

**Sell** - This is the main screen. Product cards in a grid ordered by most sold, so her top products are always at the top. She taps once to sell. Long press to undo if she made a mistake. Cards turn red when stock is low. There is a search bar for when she needs something that's not near the top.

**Manage** - Where she adds new products, edits them, restocks, or deletes them. Has a search bar too. The add and edit form slides up from the bottom.

**Summary** - Shows today's sales and all time sales separately. Reset Day button at the bottom she taps at the end of each day.

## Who Is Mama Thandi

She uses WhatsApp and Facebook but not much else. Her data is expensive. Her phone is a mid-range Android.

Every decision I made was with her in mind:

- One tap to sell because there is no time to navigate menus when there is a queue
- Long press to undo
- Grid ordered by most sold so that most sold items are always first she never has to scroll to find them
- Fully offline
- Red border on cards when stock is low so she sees it while selling without going anywhere else
- Bottom navigation because its common and easy

## How to Run It

### Requirements

- Node.js v20.20.0
- npm 10.8.2
- Expo SDK 54.0.24
- Expo Go installed on your Android phone (download from Google Play Store)
  - If using an Android emulator, Expo Go installs automatically just press 'a' after running npx expo start

### Steps

```bash
git clone https://github.com/Trence-Rams/terrence-intern-challenge.git
cd terrence-intern-challenge/challenge_5
npm install
npx expo start
```

Scan the QR code with Expo Go on your Android phone or use an Emulator.

## What I'd Add With More Time

- Daily profit breakdown per product so she can see which product made her the most money today, not just all time
- A backup feature, simple JSON export she can WhatsApp to herself so she doesn't lose data if her phone is reset
- Zulu or Xhosa language support
