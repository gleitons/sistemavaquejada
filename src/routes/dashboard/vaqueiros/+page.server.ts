import { db } from '$lib/server/db';
import { vaqueiros } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async () => {
    const list = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);
    return { vaqueiros: list };
};

export const actions = {
    registrar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        try {
            await db.insert(vaqueiros).values({
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
            });
            return { success: true };
        } catch (e: any) {
            return fail(400, { error: e.message || "Erro ao cadastrar vaqueiro" });
        }
    },
    atualizar: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const id = data.id as string;
        
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
            return { success: true };
        } catch (e: any) {
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
