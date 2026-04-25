import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { senhas, lotes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE = async ({ params }) => {
    try {
        const { id } = params;
        
        // 1. Remover todas as senhas vinculadas ao lote
        await db.delete(senhas).where(eq(senhas.loteId, id!));
        
        // 2. Remover o lote
        await db.delete(lotes).where(eq(lotes.id, id!));

        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
