import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { messages } from "@/core/i18n/messages";
import { useAuth } from "@/features/auth/presentation/auth-provider";
import { useUiPreferences } from "@/state/ui-preferences";

const recoverySchema = z.object({ email: z.string().trim().email() });
type RecoveryValues = z.infer<typeof recoverySchema>;

export default function ForgotPasswordScreen() {
	const { isConfigured, requestPasswordReset } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const text = messages[locale];
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RecoveryValues>({
		resolver: zodResolver(recoverySchema),
		defaultValues: { email: "" },
	});

	const submit = handleSubmit(async ({ email }) => {
		setError(null);
		setNotice(null);
		try {
			await requestPasswordReset(email);
			setNotice(text.passwordResetSent);
		} catch {
			setError(text.networkError);
		}
	});

	return (
		<View style={styles.container}>
			<Text style={styles.brand}>{text.appName}</Text>
			<Text style={styles.title}>{text.forgotPassword}</Text>
			<Text style={styles.label}>{text.email}</Text>
			<Controller
				control={control}
				name="email"
				render={({ field: { onBlur, onChange, value } }) => (
					<TextInput
						accessibilityLabel={text.email}
						autoCapitalize="none"
						autoComplete="email"
						editable={isConfigured && !isSubmitting}
						keyboardType="email-address"
						onBlur={onBlur}
						onChangeText={onChange}
						style={styles.input}
						value={value}
					/>
				)}
			/>
			{errors.email && <Text style={styles.error}>{text.email}</Text>}
			{!isConfigured && <Text style={styles.error}>{text.configurationNeeded}</Text>}
			{notice && (
				<Text accessibilityRole="alert" style={styles.notice}>
					{notice}
				</Text>
			)}
			{error && (
				<Text accessibilityRole="alert" style={styles.error}>
					{error}
				</Text>
			)}
			<Pressable
				accessibilityRole="button"
				disabled={!isConfigured || isSubmitting}
				onPress={() => void submit()}
				style={[styles.button, (!isConfigured || isSubmitting) && styles.disabled]}
			>
				<Text style={styles.buttonText}>{text.continueLabel}</Text>
			</Pressable>
			<Link href="/sign-in" style={styles.backLink}>
				{text.signIn}
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f5f7f2",
		flex: 1,
		gap: 14,
		justifyContent: "center",
		padding: 28,
	},
	brand: { color: "#176b55", fontSize: 16, fontWeight: "700" },
	title: {
		color: "#16251f",
		fontSize: 28,
		fontWeight: "700",
		marginBottom: 12,
	},
	label: { color: "#25362f", fontSize: 14, fontWeight: "600" },
	input: {
		backgroundColor: "#ffffff",
		borderColor: "#d6ded8",
		borderRadius: 10,
		borderWidth: 1,
		color: "#172720",
		minHeight: 52,
		paddingHorizontal: 15,
	},
	error: { color: "#a02b27", fontSize: 13 },
	notice: { color: "#176b55", fontSize: 14 },
	button: {
		alignItems: "center",
		backgroundColor: "#176b55",
		borderRadius: 10,
		justifyContent: "center",
		marginTop: 8,
		minHeight: 52,
	},
	buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
	disabled: { opacity: 0.45 },
	backLink: {
		alignSelf: "center",
		color: "#176b55",
		fontWeight: "600",
		marginTop: 12,
	},
});
