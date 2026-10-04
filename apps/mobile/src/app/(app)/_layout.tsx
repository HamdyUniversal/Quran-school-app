import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { messages } from "@/core/i18n/messages";
import { useAuth } from "@/features/auth/presentation/auth-provider";
import { useUiPreferences } from "@/state/ui-preferences";

export default function ProtectedAppLayout() {
	const { identity, isLoading, schoolAccess, signOut } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const text = messages[locale];

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator color="#176b55" />
			</View>
		);
	}

	if (!identity) {
		return <Redirect href="/sign-in" />;
	}
	if (!schoolAccess) {
		return (
			<View style={styles.loading}>
				<Text style={styles.message}>{text.accessUnavailable}</Text>
				<Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.button}>
					<Text style={styles.buttonText}>{text.signOut}</Text>
				</Pressable>
			</View>
		);
	}

	return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
	loading: {
		alignItems: "center",
		backgroundColor: "#f5f7f2",
		flex: 1,
		justifyContent: "center",
		gap: 18,
	},
	message: { color: "#25362f", fontSize: 16, textAlign: "center" },
	button: {
		backgroundColor: "#176b55",
		borderRadius: 10,
		paddingHorizontal: 18,
		paddingVertical: 12,
	},
	buttonText: { color: "#ffffff", fontWeight: "700" },
});
