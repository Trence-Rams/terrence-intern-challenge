# Reflection

The hardest part was designing for the 30 second interaction. Every feature idea I had I kept testing against that constraint. It pushed me to remove things rather than add them which is harder than it sounds.

I got stuck with safe area insets. I used SafeAreaView thinking it would fix the tab bar overlapping the Android nav bar but it did nothing. I realised SafeAreaView only handles content padding, it does not know about the tab bar. Switching to useSafeAreaInsets and applying the values manually fixed it. I also did not know that useEffect with an empty array only runs once on mount. My data was not refreshing when switching tabs until I switched to useFocusEffect.

With more time I would add a daily profit breakdown per product and a simple JSON backup she can WhatsApp to herself.

What I learned is that building for a specific user is harder than building for a generic one. Every decision had to pass the question of whether Mama Thandi would understand it without explanation.
