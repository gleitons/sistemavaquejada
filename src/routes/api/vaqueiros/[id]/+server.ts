import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { vaqueiros, vaqueirosAnimais } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const PATCH = async ({ params, request }) => {
    try {
        const { id } = params;
        const data = await request.json();
        const { animalIds, ...vaqueiroData } = data;

        await db.update(vaqueiros)
            .set({
                nomeCompleto: vaqueiroData.nomeCompleto,
                apelido: vaqueiroData.apelido,
                nomeMae: vaqueiroData.nomeMae,
                nomePai: vaqueiroData.nomePai,
                identidade: vaqueiroData.identidade,
                genero: vaqueiroData.genero,
                dataNascimento: vaqueiroData.dataNascimento,
                telefone: vaqueiroData.telefone,
                logradouro: vaqueiroData.logradouro,
                numero: vaqueiroData.numero,
                bairro: vaqueiroData.bairro,
                comunidade: vaqueiroData.comunidade,
                cidade: vaqueiroData.cidade,
                cep: vaqueiroData.cep,
                tituloEleitor: vaqueiroData.tituloEleitor,
                responsavelId: vaqueiroData.responsavelId,
                grauParentesco: vaqueiroData.grauParentesco,
            })
            .where(eq(vaqueiros.id, id!));

        // Sync animals
        await db.delete(vaqueirosAnimais).where(eq(vaqueirosAnimais.vaqueiroId, id!));
        
        if (animalIds && animalIds.length > 0) {
            await db.insert(vaqueirosAnimais).values(
                animalIds.map((animalId: string) => ({
                    vaqueiroId: id!,
                    animalId: animalId
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
        await db.delete(vaqueiros).where(eq(vaqueiros.id, id!));
        return json({ success: true });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
