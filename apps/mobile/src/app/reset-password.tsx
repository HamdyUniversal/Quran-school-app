import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { messages } from "@/core/i18n/messages";
import { useAuth } from "@/features/auth/presentation/auth-provider";
import { useUiPreferences } from "@/state/ui-preferences";

const newPasswordSchema = z
	.object({
		password: z.string().min(8),
		confirmation: z.string().min(1),
	})
	.refine((values) => values.password === values.confirmation, {
		path: ["confirmation"],
		message: "passwordMismatch",
	});

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export default function ResetPasswordScreen() {
	const router = useRouter();
	const { identity, isLoading, isConfigured, updatePassword } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const text = messages[locale];
	const [authError, setAuthError] = useState<string | null>(null);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<NewPasswordValues>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: { password: "", confirmation: "" },
	});

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<Text>{text.continueLabel}</Text>
			</View>
		);
	}
	if (!identity) {
		return <Redirect href="/sign-in" />;
	}

	const submit = handleSubmit(async ({ password }) => {
		setAuthError(null);
		try {
			await updatePassword(password);
			router.replace("/(app)");
		} catch {
			setAuthError(text.recoveryLinkInvalid);
		}
	});

	return (
		<View style={styles.container}>
			<Text style={styles.brand}>{text.appName}</Text>
			<Text style={styles.title}>{text.savePassword}</Text>
			{(["password", "confirmation"] as const).map((fieldName) => (
				<View key={fieldName} style={styles.field}>
					<Text style={styles.label}>
						{fieldName === "password" ? text.newPassword : text.confirmPassword}
					</Text>
					<Controller
						control={control}
						name={fieldName}
						render={({ field: { onBlur, onChange, value } }) => (
							<TextInput
								accessibilityLabel={
									fieldName === "password" ? text.newPassword : text.confirmPassword
								}
								autoComplete="new-password"
								editable={isConfigured && !isSubmitting}
								onBlur={onBlur}
								onChangeText={onChange}
								secureTextEntry
								style={styles.input}
								value={value}
							/>
						)}
					/>
					{errors[fieldName] && (
						<Text style={styles.error}>
							{errors[fieldName]?.message === "passwordMismatch"
								? text.passwordMismatch
								: text.password}
						</Text>
					)}
				</View>
			))}
			{authError && (
				<Text accessibilityRole="alert" style={styles.error}>
					{authError}
				</Text>
			)}
			<Pressable
				accessibilityRole="button"
				disabled={!isConfigured || isSubmitting}
				onPress={() => void submit()}
				style={[styles.button, (!isConfigured || isSubmitting) && styles.disabled]}
			>
				<Text style={styles.buttonText}>{text.savePassword}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f5f7f2",
		flex: 1,
		gap: 16,
		justifyContent: "center",
		padding: 28,
	},
	loading: {
		alignItems: "center",
		backgroundColor: "#f5f7f2",
		flex: 1,
		justifyContent: "center",
	},
	brand: { color: "#176b55", fontSize: 16, fontWeight: "700" },
	title: {
		color: "#16251f",
		fontSize: 28,
		fontWeight: "700",
		marginBottom: 12,
	},
	field: { gap: 8 },
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
});
