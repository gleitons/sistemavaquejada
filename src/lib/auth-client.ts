import { createAuthClient } from "better-auth/svelte";
import { env } from "$env/dynamic/public";

export const authClient = createAuthClient({
    baseURL: env.PUBLIC_AUTH_URL || "http://localhost:5173"
    //baseURL: env.PUBLIC_AUTH_URL || "https://sistemavaquejada.vercel.app"
});
