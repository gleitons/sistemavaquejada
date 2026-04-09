import { db } from '$lib/server/db';
import { vaqueiros, animais, vaqueirosAnimais } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq, isNotNull } from 'drizzle-orm';

export const load = async () => {
    try {
        const vaqueirosList = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);
        const animaisList = await db.select().from(animais).orderBy(animais.nome);
        
        // Fetch all associations
        const associations = await db.select({
            vaqueiroId: vaqueirosAnimais.vaqueiroId,
            animal: animais
        })
        .from(vaqueirosAnimais)
        .leftJoin(animais, eq(vaqueirosAnimais.animalId, animais.id));

        return { 
            vaqueiros: vaqueirosList.map(v => ({
                ...v,
                animais: associations
                    .filter(a => a.vaqueiroId === v.id && a.animal !== null)
                    .map(a => a.animal)
            })), 
            animais: animaisList 
        };
    } catch (e: any) {
        console.error('SERVER LOAD ERROR:', e);
        return { 
            vaqueiros: [], 
            animais: [],
            error: `Erro ao carregar dados: ${e.message}`
        };
    }
};

export const actions = {
    registrar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const animalIds = formData.getAll('animalIds') as string[];
        
        try {
            const [newVaqueiro] = await db.insert(vaqueiros).values({
                cpf: data.cpf as string,
                nomeCompleto: data.nomeCompleto as string,
                apelido: data.apelido as string,
                nomeMae: data.nomeMae as string,
                nomePai: data.nomePai as string,
                identidade: data.identidade as string,
                dataNascimento: data.dataNascimento as string,
                telefone: data.telefone as string,
                logradouro: data.logradouro as string,
                numero: data.numero as string,
                bairro: data.bairro as string,
                comunidade: data.comunidade as string,
                cidade: data.cidade as string,
                cep: data.cep as string,
                tituloEleitor: data.tituloEleitor as string,
                responsavelId: (data.responsavelId as string) || null,
                grauParentesco: (data.grauParentesco as string) || null,
            }).returning();

            if (animalIds.length > 0) {
                await db.insert(vaqueirosAnimais).values(
                    animalIds.map(animalId => ({
                        vaqueiroId: newVaqueiro.id,
                        animalId: animalId as string
                    }))
                );
            }

            return { success: true };
        } catch (e: any) {
            console.error(e);
            return fail(400, { error: e.message || "Erro ao cadastrar vaqueiro" });
        }
    },
    atualizar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const id = data.id as string;
        const animalIds = formData.getAll('animalIds') as string[];
        
        try {
            await db.update(vaqueiros)
                .set({
                    nomeCompleto: data.nomeCompleto as string,
                    apelido: data.apelido as string,
                    nomeMae: data.nomeMae as string,
                    nomePai: data.nomePai as string,
                    identidade: data.identidade as string,
                    dataNascimento: data.dataNascimento as string,
                    telefone: data.telefone as string,
                    logradouro: data.logradouro as string,
                    numero: data.numero as string,
                    bairro: data.bairro as string,
                    comunidade: data.comunidade as string,
                    cidade: data.cidade as string,
                    cep: data.cep as string,
                    tituloEleitor: data.tituloEleitor as string,
                    responsavelId: (data.responsavelId as string) || null,
                    grauParentesco: (data.grauParentesco as string) || null,
                })
                .where(eq(vaqueiros.id, id));

            // Sync animals
            await db.delete(vaqueirosAnimais).where(eq(vaqueirosAnimais.vaqueiroId, id));
            
            if (animalIds.length > 0) {
                await db.insert(vaqueirosAnimais).values(
                    animalIds.map(animalId => ({
                        vaqueiroId: id,
                        animalId: animalId as string
                    }))
                );
            }

            return { success: true };
        } catch (e: any) {
            console.error(e);
            return fail(400, { error: e.message || "Erro ao atualizar vaqueiro" });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        try {
            await db.delete(vaqueiros).where(eq(vaqueiros.id, id));
            return { success: true };
        } catch (e) {
            return fail(400, { error: "Erro ao excluir" });
        }
    }
};
