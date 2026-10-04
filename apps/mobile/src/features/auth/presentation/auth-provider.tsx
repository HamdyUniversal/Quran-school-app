import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type PropsWithChildren,
} from "react";

import { getSupabaseClient } from "@/core/supabase/client";
import { SupabaseAuthRepository } from "@/features/auth/data/supabase-auth-repository";
import type {
	AuthIdentity,
	AuthRepository,
	SchoolAccess,
} from "@/features/auth/domain/auth-repository";

type AuthContextValue = {
	identity: AuthIdentity | null;
	schoolAccess: SchoolAccess | null;
	isLoading: boolean;
	isConfigured: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	requestPasswordReset: (email: string) => Promise<void>;
	exchangeCodeForSession: (code: string) => Promise<void>;
	updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
	const [repository] = useState<AuthRepository | null>(() => {
		const client = getSupabaseClient();
		return client ? new SupabaseAuthRepository(client) : null;
	});
	const [identity, setIdentity] = useState<AuthIdentity | null>(null);
	const [schoolAccess, setSchoolAccess] = useState<SchoolAccess | null | undefined>(
		repository ? undefined : null,
	);
	const [isSessionLoading, setIsSessionLoading] = useState(repository !== null);

	useEffect(() => {
		if (!repository) {
			return;
		}

		let isActive = true;
		const unsubscribe = repository.onIdentityChanged((nextIdentity) => {
			if (isActive) {
				setIdentity(nextIdentity);
				setSchoolAccess(nextIdentity ? undefined : null);
				setIsSessionLoading(false);
			}
		});

		void repository
			.getCurrentIdentity()
			.then((currentIdentity) => {
				if (isActive) {
					setIdentity(currentIdentity);
					setSchoolAccess(currentIdentity ? undefined : null);
					setIsSessionLoading(false);
				}
			})
			.catch(() => {
				if (isActive) {
					setIdentity(null);
					setSchoolAccess(null);
					setIsSessionLoading(false);
				}
			});

		return () => {
			isActive = false;
			unsubscribe();
		};
	}, [repository]);

	useEffect(() => {
		if (!identity || !repository) {
			return;
		}

		let isActive = true;
		void repository
			.getCurrentSchoolAccess()
			.then((access) => {
				if (isActive) {
					setSchoolAccess(access);
				}
			})
			.catch(() => {
				if (isActive) {
					setSchoolAccess(null);
				}
			});

		return () => {
			isActive = false;
		};
	}, [identity, repository]);

	const signIn = useCallback(
		async (email: string, password: string) => {
			if (!repository) {
				throw new Error("Supabase is not configured.");
			}
			await repository.signIn(email, password);
		},
		[repository],
	);
	const signOut = useCallback(async () => {
		await repository?.signOut();
	}, [repository]);
	const requestPasswordReset = useCallback(
		async (email: string) => {
			if (!repository) {
				throw new Error("Supabase is not configured.");
			}
			await repository.requestPasswordReset(email);
		},
		[repository],
	);
	const exchangeCodeForSession = useCallback(
		async (code: string) => {
			if (!repository) {
				throw new Error("Supabase is not configured.");
			}
			await repository.exchangeCodeForSession(code);
		},
		[repository],
	);
	const updatePassword = useCallback(
		async (password: string) => {
			if (!repository) {
				throw new Error("Supabase is not configured.");
			}
			await repository.updatePassword(password);
		},
		[repository],
	);

	const isLoading = isSessionLoading || (identity !== null && schoolAccess === undefined);
	const value = useMemo<AuthContextValue>(
		() => ({
			identity,
			schoolAccess: schoolAccess ?? null,
			isLoading,
			isConfigured: repository !== null,
			signIn,
			signOut,
			requestPasswordReset,
			exchangeCodeForSession,
			updatePassword,
		}),
		[
			identity,
			schoolAccess,
			isLoading,
			repository,
			signIn,
			signOut,
			requestPasswordReset,
			exchangeCodeForSession,
			updatePassword,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider.");
	}

	return context;
}
