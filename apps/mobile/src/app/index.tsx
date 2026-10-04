import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth/presentation/auth-provider";

export default function IndexRoute() {
	const { identity, isLoading } = useAuth();

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator color="#176b55" />
			</View>
		);
	}

	return <Redirect href={identity ? "/(app)" : "/sign-in"} />;
}

const styles = StyleSheet.create({
	loading: {
		alignItems: "center",
		backgroundColor: "#f5f7f2",
		flex: 1,
		justifyContent: "center",
	},
});
