import { db } from '$lib/server/db';
import { senhas, vaqueiros, animais, lotes } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, and, asc, desc } from 'drizzle-orm';

export const load = async () => {
    const batches = await db.select().from(lotes).orderBy(desc(lotes.createdAt));
    
    const list = await db.select({
        id: senhas.id,
        numero: senhas.numero,
        status: senhas.status,
        dataCompeticao: senhas.dataCompeticao,
        loteId: senhas.loteId,
        puxadorId: senhas.vaqueiroPuxadorId,
        esteiraId: senhas.vaqueiroEsteiraId,
        animalPuxadorId: senhas.animalPuxadorId,
        animalEsteiraId: senhas.animalEsteiraId
    })
    .from(senhas)
    .orderBy(asc(senhas.numero));

    const vaqueirosList = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);
    const animaisList = await db.select().from(animais).orderBy(animais.nome);

    return { 
        senhas: list || [], 
        lotes: batches || [],
        vaqueiros: vaqueirosList || [], 
        animais: animaisList || [] 
    };
};

export const actions = {
    gerar: async ({ request }) => {
        const formData = await request.formData();
        const inicio = parseInt(formData.get('inicio') as string);
        const fim = parseInt(formData.get('fim') as string);
        const data = formData.get('data') as string;

        if (isNaN(inicio) || isNaN(fim) || inicio > fim) {
            return fail(400, { error: 'Intervalo inválido' });
        }

        try {
            // 1. Criar o lote
            const [newLote] = await db.insert(lotes).values({
                inicio,
                fim,
                dataCompeticao: data
            }).returning();

            // 2. Criar as senhas vinculadas ao lote
            const batch = [];
            for (let i = inicio; i <= fim; i++) {
                batch.push({
                    numero: i,
                    dataCompeticao: data,
                    loteId: newLote.id,
                    status: 'disponivel' as const
                });
            }
            
            if (batch.length > 0) {
                await db.insert(senhas).values(batch);
            }
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: e.message || 'Erro ao gerar senhas' });
        }
    },

    vincular: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        const puxadorId = formData.get('puxadorId') as string;
        const animalPuxadorId = formData.get('animalPuxadorId') as string;
        const esteiraId = formData.get('esteiraId') as string;
        const animalEsteiraId = formData.get('animalEsteiraId') as string;
        const data = formData.get('data') as string;

        try {
            await db.update(senhas)
                .set({
                    vaqueiroPuxadorId: puxadorId || null,
                    animalPuxadorId: animalPuxadorId || null,
                    vaqueiroEsteiraId: esteiraId || null,
                    animalEsteiraId: animalEsteiraId || null,
                    dataCompeticao: data || null,
                    status: 'vinculado'
                })
                .where(eq(senhas.id, id));
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: e.message || 'Erro ao vincular senha' });
        }
    },

    remover: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        try {
            await db.delete(senhas).where(eq(senhas.id, id));
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: 'Erro ao remover' });
        }
    },

    desvincular: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return fail(400, { error: 'ID não fornecido' });

        try {
            await db.update(senhas)
                .set({
                    vaqueiroPuxadorId: null,
                    animalPuxadorId: null,
                    vaqueiroEsteiraId: null,
                    animalEsteiraId: null,
                    dataCompeticao: null,
                    status: 'disponivel'
                })
                .where(eq(senhas.id, id));
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: 'Erro ao desvincular senha' });
        }
    },

    removerLote: async ({ request }) => {
        const formData = await request.formData();
        const loteId = formData.get('loteId') as string;

        if (!loteId) return fail(400, { error: 'ID do lote não fornecido' });

        try {
            // 1. Remover todas as senhas vinculadas ao lote
            await db.delete(senhas).where(eq(senhas.loteId, loteId));
            
            // 2. Remover o lote
            await db.delete(lotes).where(eq(lotes.id, loteId));

            return { success: true };
        } catch (e: any) {
            return fail(400, { error: 'Erro ao remover lote' });
        }
    }
};
