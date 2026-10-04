import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/presentation/auth-provider";
import { messages } from "@/core/i18n/messages";
import { useUiPreferences } from "@/state/ui-preferences";

export default function AuthCallbackScreen() {
	const params = useLocalSearchParams<{ code?: string }>();
	const code = typeof params.code === "string" ? params.code : null;
	const router = useRouter();
	const { exchangeCodeForSession, isConfigured } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const [exchangeFailed, setExchangeFailed] = useState(false);
	const hasError = !code || !isConfigured || exchangeFailed;

	useEffect(() => {
		let isActive = true;
		if (!code || !isConfigured) {
			return;
		}

		void exchangeCodeForSession(code)
			.then(() => {
				if (isActive) {
					router.replace("/reset-password");
				}
			})
			.catch(() => {
				if (isActive) {
					setExchangeFailed(true);
				}
			});

		return () => {
			isActive = false;
		};
	}, [code, exchangeCodeForSession, isConfigured, router]);

	return (
		<View style={styles.container}>
			{hasError ? (
				<Text style={styles.error}>{messages[locale].recoveryLinkInvalid}</Text>
			) : (
				<ActivityIndicator color="#176b55" />
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		backgroundColor: "#f5f7f2",
		flex: 1,
		justifyContent: "center",
		padding: 28,
	},
	error: { color: "#a02b27", fontSize: 15, textAlign: "center" },
});
