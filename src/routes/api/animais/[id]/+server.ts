import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { animais, vaqueirosAnimais } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const PATCH = async ({ params, request }) => {
    try {
        const { id } = params;
        const data = await request.json();
        const { vaqueiroIds, ...animalData } = data;

        await db.update(animais)
            .set({
                nome: animalData.nome,
                cor: animalData.cor,
                raca: animalData.raca,
                sexo: animalData.sexo,
                dataNascimento: animalData.dataNascimento,
                peso: animalData.peso ? parseFloat(animalData.peso) : null,
                categoria: animalData.categoria,
                pai: animalData.pai,
                mae: animalData.mae,
                valorReal: animalData.valorReal ? parseFloat(animalData.valorReal) : null,
                vaqueiroId: vaqueiroIds && vaqueiroIds.length > 0 ? vaqueiroIds[0] : null,
            })
            .where(eq(animais.id, id!));

        // Sync vaqueiros
        await db.delete(vaqueirosAnimais).where(eq(vaqueirosAnimais.animalId, id!));
        
        if (vaqueiroIds && vaqueiroIds.length > 0) {
            await db.insert(vaqueirosAnimais).values(
                vaqueiroIds.map((vId: string) => ({
                    vaqueiroId: vId,
                    animalId: id!
                }))
            );
        }

        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};

export const DELETE = async ({ params }) => {
    try {
        const { id } = params;
        await db.delete(animais).where(eq(animais.id, id!));
        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
