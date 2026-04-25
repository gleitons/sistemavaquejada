import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { senhas, lotes } from '$lib/server/db/schema';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { inicio, fim, dataCompeticao } = data;

        // 1. Criar o lote
        const [newLote] = await db.insert(lotes).values({
            id: data.loteId || crypto.randomUUID(),
            inicio,
            fim,
            dataCompeticao
        }).returning();

        // 2. Criar as senhas vinculadas ao lote
        const batch = [];
        for (let i = inicio; i <= fim; i++) {
            batch.push({
                id: crypto.randomUUID(),
                numero: i,
                dataCompeticao,
                loteId: newLote.id,
                status: 'disponivel' as const
            });
        }
        
        if (batch.length > 0) {
            await db.insert(senhas).values(batch);
        }

        return json({ success: true, loteId: newLote.id });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
