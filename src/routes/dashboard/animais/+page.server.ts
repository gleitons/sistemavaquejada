import { db } from '$lib/server/db';
import { animais, vaqueiros, vaqueirosAnimais } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {
    try {
        const animaisList = await db.select().from(animais).orderBy(animais.nome);
        const vaqueirosList = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);

        const associations = await db.select({
            animalId: vaqueirosAnimais.animalId,
            vaqueiro: vaqueiros
        })
        .from(vaqueirosAnimais)
        .leftJoin(vaqueiros, eq(vaqueirosAnimais.vaqueiroId, vaqueiros.id));

        return { 
            animais: animaisList.map(a => ({
                ...a,
                vaqueiros: associations
                    .filter(assoc => assoc.animalId === a.id && assoc.vaqueiro !== null)
                    .map(assoc => assoc.vaqueiro),
                // Maintain backward compatibility for UI fields if needed
                vaqueiroNome: associations.find(assoc => assoc.animalId === a.id)?.vaqueiro?.nomeCompleto,
                vaqueiroCpf: associations.find(assoc => assoc.animalId === a.id)?.vaqueiro?.cpf
            })), 
            vaqueiros: vaqueirosList 
        };
    } catch (e: any) {
        console.error('SERVER LOAD ERROR (animais):', e);
        return {
            animais: [],
            vaqueiros: [],
            error: `Erro ao carregar dados: ${e.message}`
        }
    }
};

export const actions = {
    registrar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const vaqueiroIds = formData.getAll('vaqueiroIds') as string[];
        
        try {
            const [newAnimal] = await db.insert(animais).values({
                nome: data.nome as string,
                cor: data.cor as string,
                raca: data.raca as string,
                dataNascimento: data.dataNascimento as string,
                peso: data.peso ? parseFloat(data.peso as string) : null,
                categoria: data.categoria as string,
                pai: data.pai as string,
                mae: data.mae as string,
                valorReal: data.valorReal ? parseFloat(data.valorReal as string) : null,
                vaqueiroId: (vaqueiroIds[0] as string) || null, // Keep sync with legacy for now
            }).returning();

            if (vaqueiroIds.length > 0) {
                await db.insert(vaqueirosAnimais).values(
                    vaqueiroIds.map(vId => ({
                        vaqueiroId: vId as string,
                        animalId: newAnimal.id
                    }))
                );
            }

            return { success: true };
        } catch (e: any) {
            console.error(e);
            return fail(400, { error: e.message || "Erro ao cadastrar animal" });
        }
    },
    atualizar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const id = data.id as string;
        const vaqueiroIds = formData.getAll('vaqueiroIds') as string[];
        
        try {
            await db.update(animais)
                .set({
                    nome: data.nome as string,
                    cor: data.cor as string,
                    raca: data.raca as string,
                    dataNascimento: data.dataNascimento as string,
                    peso: data.peso ? parseFloat(data.peso as string) : null,
                    categoria: data.categoria as string,
                    pai: data.pai as string,
                    mae: data.mae as string,
                    valorReal: data.valorReal ? parseFloat(data.valorReal as string) : null,
                    vaqueiroId: (vaqueiroIds[0] as string) || null,
                })
                .where(eq(animais.id, id));

            // Sync vaqueiros
            await db.delete(vaqueirosAnimais).where(eq(vaqueirosAnimais.animalId, id));
            
            if (vaqueiroIds.length > 0) {
                await db.insert(vaqueirosAnimais).values(
                    vaqueiroIds.map(vId => ({
                        vaqueiroId: vId as string,
                        animalId: id
                    }))
                );
            }

            return { success: true };
        } catch (e: any) {
            console.error(e);
            return fail(400, { error: e.message || "Erro ao atualizar animal" });
        }
    },
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;
        try {
            await db.delete(animais).where(eq(animais.id, id));
            return { success: true };
        } catch (e) {
            return fail(400, { error: "Erro ao excluir" });
        }
    }
};
