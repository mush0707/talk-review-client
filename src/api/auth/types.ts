export type AuthProvider = "local";

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export type AuthTokenResponse = {
    token: string;
    user: AuthUser;
    must_verify_email: boolean;
    email_verified: boolean;
};

export type MeResponse = {
    user: AuthUser;
    must_verify_email: boolean;
    email_verified: boolean;
};

export type RegisterPayload = {
    provider: AuthProvider;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
};

export type LoginPayload = {
    provider: AuthProvider;
    email: string;
    password: string;
};
