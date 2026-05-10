export type LoginBody = {
    username: string;
    password: string;
}

export type UserSession = {
    id: string;
    username: string;
    email: string;
    role: string;
    poliId?: number | null;
};