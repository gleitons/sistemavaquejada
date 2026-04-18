import { db } from '$lib/server/db';
import { vaqueiros, animais, senhas } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
    const allVaqueiros = await db.query.vaqueiros.findMany({
        orderBy: (v, { asc }) => [asc(v.nomeCompleto)],
        with: {
            animaisAtribuidos: {
                with: { animal: true }
            }
        }
    });

    const allAnimais = await db.query.animais.findMany({
        orderBy: (a, { asc }) => [asc(a.nome)],
        with: {
            vaqueirosAtribuidos: {
                with: { vaqueiro: true }
            }
        }
    });

    const allSenhas = await db.select().from(senhas);

    return { vaqueiros: allVaqueiros, animais: allAnimais, senhas: allSenhas };
};
