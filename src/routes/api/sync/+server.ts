import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { vaqueiros, animais, senhas, lotes } from '$lib/server/db/schema';

export const GET = async () => {
    try {
        const vaqueirosList = await db.select().from(vaqueiros);
        const animaisList = await db.select().from(animais);
        const senhasList = await db.select().from(senhas);
        const lotesList = await db.select().from(lotes);

        return json({
            vaqueiros: vaqueirosList,
            animais: animaisList,
            senhas: senhasList,
            lotes: lotesList
        });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
