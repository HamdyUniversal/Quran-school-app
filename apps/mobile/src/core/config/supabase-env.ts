import { z } from "zod";

const supabaseEnvironmentSchema = z.object({
	url: z.string().url(),
	anonKey: z.string().min(1),
});

const anonKey =
	process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
	process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	"";

export const supabaseEnvironment = supabaseEnvironmentSchema.safeParse({
	url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
	anonKey,
});

export const isSupabaseConfigured = supabaseEnvironment.success;
