import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { senhas } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const PATCH = async ({ params, request }) => {
    try {
        const { id } = params;
        const data = await request.json();
        
        // Handle "vincular" and "desvincular" logic based on input
        const updateData: any = {
            vaqueiroPuxadorId: data.vaqueiroPuxadorId || null,
            animalPuxadorId: data.animalPuxadorId || null,
            vaqueiroEsteiraId: data.vaqueiroEsteiraId || null,
            animalEsteiraId: data.animalEsteiraId || null,
            dataCompeticao: data.dataCompeticao || null,
            status: data.status || 'disponivel'
        };

        if (data.status === 'vinculado') {
            updateData.dataCadastro = new Date();
        } else {
            updateData.dataCadastro = null;
        }

        await db.update(senhas)
            .set(updateData)
            .where(eq(senhas.id, id!));

        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};

export const DELETE = async ({ params }) => {
    try {
        const { id } = params;
        await db.delete(senhas).where(eq(senhas.id, id!));
        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
