import { db } from '$lib/server/db';
import { animais, vaqueiros } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {
    const list = await db.select({
        id: animais.id,
        nome: animais.nome,
        cor: animais.cor,
        raca: animais.raca,
        dataNascimento: animais.dataNascimento,
        peso: animais.peso,
        categoria: animais.categoria,
        pai: animais.pai,
        mae: animais.mae,
        valorReal: animais.valorReal,
        vaqueiroId: animais.vaqueiroId,
        vaqueiroNome: vaqueiros.nomeCompleto,
        vaqueiroCpf: vaqueiros.cpf
    })
    .from(animais)
    .leftJoin(vaqueiros, eq(animais.vaqueiroId, vaqueiros.id))
    .orderBy(animais.nome);

    const vaqueirosList = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);

    return { animais: list, vaqueiros: vaqueirosList };
};

export const actions = {
    registrar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        try {
            await db.insert(animais).values({
                nome: data.nome as string,
                cor: data.cor as string,
                raca: data.raca as string,
                dataNascimento: data.dataNascimento as string,
                peso: data.peso ? parseFloat(data.peso as string) : null,
                categoria: data.categoria as string,
                pai: data.pai as string,
                mae: data.mae as string,
                valorReal: data.valorReal ? parseFloat(data.valorReal as string) : null,
                vaqueiroId: data.vaqueiroId as string,
            });
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: e.message || "Erro ao cadastrar animal" });
        }
    },
    atualizar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const id = data.id as string;
        
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
                    vaqueiroId: data.vaqueiroId as string,
                })
                .where(eq(animais.id, id));
            return { success: true };
        } catch (e: any) {
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
