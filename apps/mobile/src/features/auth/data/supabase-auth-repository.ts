import type { SupabaseClient } from "@supabase/supabase-js";

import type {
	AuthIdentity,
	AuthRepository,
	SchoolAccess,
} from "@/features/auth/domain/auth-repository";

export class SupabaseAuthRepository implements AuthRepository {
	constructor(private readonly client: SupabaseClient) {}

	async getCurrentIdentity(): Promise<AuthIdentity | null> {
		const { data, error } = await this.client.auth.getSession();
		if (error) {
			throw error;
		}

		return data.session ? { userId: data.session.user.id } : null;
	}

	async getCurrentSchoolAccess(): Promise<SchoolAccess | null> {
		const identity = await this.getCurrentIdentity();
		if (!identity) {
			return null;
		}

		const { data: memberships, error: membershipError } = await this.client
			.from("school_memberships")
			.select("id, school_id")
			.eq("profile_id", identity.userId)
			.eq("status", "active")
			.order("created_at", { ascending: true })
			.limit(1);

		if (membershipError) {
			throw membershipError;
		}

		const membership = memberships?.[0];
		if (!membership) {
			return null;
		}

		const { data: roleRows, error: roleError } = await this.client
			.from("membership_roles")
			.select("role:roles(code)")
			.eq("membership_id", membership.id);

		if (roleError) {
			throw roleError;
		}

		const roleCodes = (roleRows ?? [])
			.flatMap((row) => row.role.map((role) => role.code))
			.filter((code): code is string => typeof code === "string");

		if (roleCodes.length === 0) {
			return null;
		}

		const { data: school, error: schoolError } = await this.client
			.from("schools")
			.select("id")
			.eq("id", membership.school_id)
			.maybeSingle();

		if (schoolError) {
			throw schoolError;
		}

		return school ? { schoolId: school.id, roleCodes } : null;
	}

	async signIn(email: string, password: string): Promise<void> {
		const { error } = await this.client.auth.signInWithPassword({ email, password });
		if (error) {
			throw error;
		}
	}

	async signOut(): Promise<void> {
		const { error } = await this.client.auth.signOut();
		if (error) {
			throw error;
		}
	}

	async requestPasswordReset(email: string): Promise<void> {
		const { error } = await this.client.auth.resetPasswordForEmail(email, {
			redirectTo: "quran-school://auth/callback",
		});
		if (error) {
			throw error;
		}
	}

	async updatePassword(password: string): Promise<void> {
		const { error } = await this.client.auth.updateUser({ password });
		if (error) {
			throw error;
		}
	}

	async exchangeCodeForSession(code: string): Promise<void> {
		const { error } = await this.client.auth.exchangeCodeForSession(code);
		if (error) {
			throw error;
		}
	}

	onIdentityChanged(listener: (identity: AuthIdentity | null) => void): () => void {
		const { data } = this.client.auth.onAuthStateChange((_event, session) => {
			listener(session ? { userId: session.user.id } : null);
		});

		return () => data.subscription.unsubscribe();
	}
}
