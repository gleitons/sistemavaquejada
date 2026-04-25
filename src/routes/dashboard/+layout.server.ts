import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    // If we have an auth error (likely offline), we allow the load to proceed
    // to enable offline usage of the dashboard.
    // @ts-ignore
    if (!locals.user && !locals.authError) {
        throw redirect(303, "/");
    }
    return {
        user: locals.user
    }
}