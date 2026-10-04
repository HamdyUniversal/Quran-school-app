import "react-native-url-polyfill/auto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { supabaseEnvironment } from "@/core/config/supabase-env";

const authStorage = {
	async getItem(key: string): Promise<string | null> {
		if (Platform.OS === "web") {
			return typeof window === "undefined" ? null : window.localStorage.getItem(key);
		}

		return SecureStore.getItemAsync(key);
	},
	async setItem(key: string, value: string): Promise<void> {
		if (Platform.OS === "web") {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, value);
			}
			return;
		}

		await SecureStore.setItemAsync(key, value, {
			keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
		});
	},
	async removeItem(key: string): Promise<void> {
		if (Platform.OS === "web") {
			if (typeof window !== "undefined") {
				window.localStorage.removeItem(key);
			}
			return;
		}

		await SecureStore.deleteItemAsync(key);
	},
};

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
	if (!supabaseEnvironment.success) {
		return null;
	}

	if (!supabaseClient) {
		supabaseClient = createClient(supabaseEnvironment.data.url, supabaseEnvironment.data.anonKey, {
			auth: {
				autoRefreshToken: true,
				detectSessionInUrl: Platform.OS === "web",
				flowType: "pkce",
				persistSession: true,
				storage: authStorage,
			},
		});
	}

	return supabaseClient;
}
