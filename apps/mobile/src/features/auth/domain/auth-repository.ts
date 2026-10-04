export type AuthIdentity = {
	userId: string;
};

export type SchoolAccess = {
	schoolId: string;
	roleCodes: string[];
};

export interface AuthRepository {
	getCurrentIdentity(): Promise<AuthIdentity | null>;
	getCurrentSchoolAccess(): Promise<SchoolAccess | null>;
	signIn(email: string, password: string): Promise<void>;
	signOut(): Promise<void>;
	requestPasswordReset(email: string): Promise<void>;
	exchangeCodeForSession(code: string): Promise<void>;
	updatePassword(password: string): Promise<void>;
	onIdentityChanged(listener: (identity: AuthIdentity | null) => void): () => void;
}
