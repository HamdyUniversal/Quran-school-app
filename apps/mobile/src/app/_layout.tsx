import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppProviders } from "@/core/providers/app-providers";

export default function RootLayout() {
	const colorScheme = useColorScheme();

	return (
		<SafeAreaProvider>
			<AppProviders>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="sign-in" />
						<Stack.Screen name="forgot-password" />
						<Stack.Screen name="auth/callback" />
						<Stack.Screen name="reset-password" />
						<Stack.Screen name="(app)" />
					</Stack>
				</ThemeProvider>
			</AppProviders>
		</SafeAreaProvider>
	);
}
