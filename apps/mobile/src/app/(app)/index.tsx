import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { messages } from "@/core/i18n/messages";
import { useAuth } from "@/features/auth/presentation/auth-provider";
import { useUiPreferences } from "@/state/ui-preferences";

export default function DashboardScreen() {
	const { schoolAccess, signOut } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const text = messages[locale];
	const [signOutError, setSignOutError] = useState(false);
	const roleTitle = schoolAccess?.roleCodes.includes("administrator")
		? text.administratorDashboard
		: schoolAccess?.roleCodes.includes("teacher")
			? text.teacherDashboard
			: text.studentDashboard;

	const handleSignOut = async () => {
		setSignOutError(false);
		try {
			await signOut();
		} catch {
			setSignOutError(true);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<View>
					<Text style={styles.eyebrow}>{text.appName}</Text>
					<Text style={styles.title}>{roleTitle}</Text>
				</View>
				<Pressable
					accessibilityRole="button"
					onPress={() => void handleSignOut()}
					style={styles.signOut}
				>
					<Text style={styles.signOutText}>{text.signOut}</Text>
				</Pressable>
			</View>

			<View style={styles.statusBand}>
				<View style={styles.statusDot} />
				<Text style={styles.statusText}>{text.accountReady}</Text>
			</View>

			{signOutError && (
				<Text accessibilityRole="alert" style={styles.error}>
					{text.networkError}
				</Text>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { backgroundColor: "#f5f7f2", flex: 1, paddingHorizontal: 24 },
	header: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 28,
		paddingTop: 20,
	},
	eyebrow: {
		color: "#176b55",
		fontSize: 14,
		fontWeight: "700",
		marginBottom: 6,
	},
	title: { color: "#16251f", fontSize: 25, fontWeight: "700" },
	signOut: {
		borderColor: "#cbd6ce",
		borderRadius: 9,
		borderWidth: 1,
		paddingHorizontal: 13,
		paddingVertical: 10,
	},
	signOutText: { color: "#315046", fontSize: 13, fontWeight: "600" },
	statusBand: {
		alignItems: "center",
		backgroundColor: "#e4efe8",
		borderRadius: 12,
		flexDirection: "row",
		gap: 10,
		padding: 16,
	},
	statusDot: {
		backgroundColor: "#27815e",
		borderRadius: 5,
		height: 10,
		width: 10,
	},
	statusText: { color: "#204638", fontSize: 15, fontWeight: "600" },
	error: { color: "#a02b27", fontSize: 13, marginTop: 14 },
});
