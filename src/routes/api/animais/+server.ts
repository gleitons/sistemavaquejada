import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { animais, vaqueirosAnimais } from '$lib/server/db/schema';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { vaqueiroIds, ...animalData } = data;

        const [newAnimal] = await db.insert(animais).values({
            id: animalData.id,
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
        }).returning();

        if (vaqueiroIds && vaqueiroIds.length > 0) {
            await db.insert(vaqueirosAnimais).values(
                vaqueiroIds.map((vId: string) => ({
                    vaqueiroId: vId,
                    animalId: newAnimal.id
                }))
            );
        }

        return json({ success: true, id: newAnimal.id });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
