import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { vaqueiros, vaqueirosAnimais } from '$lib/server/db/schema';

export const POST = async ({ request }) => {
    try {
        const data = await request.json();
        const { animalIds, ...vaqueiroData } = data;

        const insertResult = await db.insert(vaqueiros).values({
            id: vaqueiroData.id,
            cpf: vaqueiroData.cpf,
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
        }).returning();

        const newVaqueiro = (insertResult as any[])[0];

        if (animalIds && animalIds.length > 0) {
            await db.insert(vaqueirosAnimais).values(
                animalIds.map((animalId: string) => ({
                    vaqueiroId: newVaqueiro.id,
                    animalId: animalId
                }))
            );
        }

        return json({ success: true, id: newVaqueiro.id });
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 400 });
    }
};
