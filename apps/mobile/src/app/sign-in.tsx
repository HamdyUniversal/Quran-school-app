import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Redirect, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { z } from "zod";

import type { AppLocale } from "@/core/i18n/messages";
import { messages } from "@/core/i18n/messages";
import { useUiPreferences } from "@/state/ui-preferences";
import { useAuth } from "@/features/auth/presentation/auth-provider";

const signInSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(1),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
	const router = useRouter();
	const { identity, isConfigured, isLoading, signIn } = useAuth();
	const locale = useUiPreferences((state) => state.locale);
	const setLocale = useUiPreferences((state) => state.setLocale);
	const text = messages[locale];
	const isRtl = locale === "ar";
	const [authError, setAuthError] = useState<string | null>(null);
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: "", password: "" },
	});

	if (isLoading) {
		return (
			<View style={styles.loading}>
				<ActivityIndicator color="#176b55" />
			</View>
		);
	}

	if (identity) {
		return <Redirect href="/(app)" />;
	}

	const submit = handleSubmit(async (values) => {
		setAuthError(null);
		try {
			await signIn(values.email, values.password);
			router.replace("/(app)");
		} catch {
			setAuthError(text.networkError);
		}
	});

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.keyboard}
		>
			<ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
				<View style={styles.container}>
					<View style={styles.topRow}>
						<View style={styles.brandMark}>
							<Text style={styles.brandMarkText}>ق</Text>
						</View>
						<View style={styles.localeSwitch} accessibilityRole="tablist">
							{(["ar", "en"] as AppLocale[]).map((option) => (
								<Pressable
									accessibilityRole="tab"
									accessibilityState={{ selected: locale === option }}
									key={option}
									onPress={() => setLocale(option)}
									style={[styles.localeButton, locale === option && styles.localeButtonActive]}
								>
									<Text style={[styles.localeLabel, locale === option && styles.localeLabelActive]}>
										{option === "ar" ? "عربي" : "EN"}
									</Text>
								</Pressable>
							))}
						</View>
					</View>

					<View style={styles.heading}>
						<Text style={[styles.eyebrow, isRtl && styles.textRtl]}>{text.appName}</Text>
						<Text style={[styles.title, isRtl && styles.textRtl]}>{text.welcomeBack}</Text>
						<Text style={[styles.subtitle, isRtl && styles.textRtl]}>{text.signIn}</Text>
					</View>

					{!isConfigured && (
						<View accessibilityRole="alert" style={styles.notice}>
							<Text style={[styles.noticeText, isRtl && styles.textRtl]}>
								{text.configurationNeeded}
							</Text>
						</View>
					)}

					<View style={styles.form}>
						<View style={styles.field}>
							<Text style={[styles.label, isRtl && styles.textRtl]}>{text.email}</Text>
							<Controller
								control={control}
								name="email"
								render={({ field: { onBlur, onChange, value } }) => (
									<TextInput
										accessibilityLabel={text.email}
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										editable={isConfigured && !isSubmitting}
										keyboardType="email-address"
										onBlur={onBlur}
										onChangeText={onChange}
										placeholder="name@example.com"
										placeholderTextColor="#7c8984"
										style={[styles.input, isRtl && styles.textRtl]}
										textContentType="emailAddress"
										value={value}
									/>
								)}
							/>
							{errors.email && (
								<Text style={[styles.error, isRtl && styles.textRtl]}>{text.email}</Text>
							)}
						</View>

						<View style={styles.field}>
							<Text style={[styles.label, isRtl && styles.textRtl]}>{text.password}</Text>
							<Controller
								control={control}
								name="password"
								render={({ field: { onBlur, onChange, value } }) => (
									<TextInput
										accessibilityLabel={text.password}
										autoCapitalize="none"
										autoComplete="current-password"
										editable={isConfigured && !isSubmitting}
										onBlur={onBlur}
										onChangeText={onChange}
										onSubmitEditing={() => void submit()}
										placeholder="••••••••"
										placeholderTextColor="#7c8984"
										secureTextEntry
										style={[styles.input, isRtl && styles.textRtl]}
										textContentType="password"
										value={value}
									/>
								)}
							/>
							{errors.password && (
								<Text style={[styles.error, isRtl && styles.textRtl]}>{text.password}</Text>
							)}
						</View>

						<Link href="/forgot-password" asChild>
							<Pressable accessibilityRole="link" style={styles.forgotLink}>
								<Text style={styles.forgotText}>{text.forgotPassword}</Text>
							</Pressable>
						</Link>

						{authError && (
							<Text accessibilityRole="alert" style={[styles.error, isRtl && styles.textRtl]}>
								{authError}
							</Text>
						)}

						<Pressable
							accessibilityRole="button"
							disabled={!isConfigured || isSubmitting}
							onPress={() => void submit()}
							style={({ pressed }) => [
								styles.primaryButton,
								(!isConfigured || isSubmitting) && styles.buttonDisabled,
								pressed && styles.buttonPressed,
							]}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<Text style={styles.primaryButtonText}>{text.continueLabel}</Text>
							)}
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	keyboard: { backgroundColor: "#f5f7f2", flex: 1 },
	scroll: { flexGrow: 1, justifyContent: "center" },
	container: { alignSelf: "center", maxWidth: 480, padding: 28, width: "100%" },
	textRtl: { textAlign: "right", writingDirection: "rtl" },
	topRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	brandMark: {
		alignItems: "center",
		backgroundColor: "#176b55",
		borderRadius: 16,
		height: 52,
		justifyContent: "center",
		width: 52,
	},
	brandMarkText: { color: "#ffffff", fontSize: 27, fontWeight: "700" },
	localeSwitch: {
		backgroundColor: "#e6ebe5",
		borderRadius: 10,
		flexDirection: "row",
		padding: 3,
	},
	localeButton: {
		borderRadius: 8,
		minWidth: 44,
		paddingHorizontal: 10,
		paddingVertical: 7,
	},
	localeButtonActive: { backgroundColor: "#ffffff" },
	localeLabel: {
		color: "#53615b",
		fontSize: 13,
		fontWeight: "600",
		textAlign: "center",
	},
	localeLabelActive: { color: "#153a30" },
	heading: { gap: 8, marginBottom: 30, marginTop: 48 },
	eyebrow: { color: "#176b55", fontSize: 15, fontWeight: "700" },
	title: { color: "#16251f", fontSize: 32, fontWeight: "700" },
	subtitle: { color: "#5b6963", fontSize: 16 },
	notice: {
		backgroundColor: "#fff3d7",
		borderColor: "#e5c775",
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 20,
		padding: 14,
	},
	noticeText: { color: "#5a471c", fontSize: 14, lineHeight: 21 },
	form: { gap: 18 },
	field: { gap: 8 },
	label: { color: "#25362f", fontSize: 14, fontWeight: "600" },
	input: {
		backgroundColor: "#ffffff",
		borderColor: "#d6ded8",
		borderRadius: 10,
		borderWidth: 1,
		color: "#172720",
		fontSize: 16,
		minHeight: 52,
		paddingHorizontal: 15,
	},
	error: { color: "#a02b27", fontSize: 13 },
	forgotLink: { alignSelf: "flex-start", paddingVertical: 4 },
	forgotText: { color: "#176b55", fontSize: 14, fontWeight: "600" },
	primaryButton: {
		alignItems: "center",
		backgroundColor: "#176b55",
		borderRadius: 10,
		justifyContent: "center",
		marginTop: 6,
		minHeight: 54,
	},
	primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
	buttonDisabled: { opacity: 0.45 },
	buttonPressed: { opacity: 0.8 },
	loading: {
		alignItems: "center",
		backgroundColor: "#f5f7f2",
		flex: 1,
		justifyContent: "center",
	},
});
