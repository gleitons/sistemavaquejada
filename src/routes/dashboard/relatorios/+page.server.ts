import { db } from '$lib/server/db';
import { vaqueiros, animais } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
    const allVaqueiros = await db.select().from(vaqueiros).orderBy(vaqueiros.nomeCompleto);
    const allAnimais = await db.select({
        nome: animais.nome,
        categoria: animais.categoria,
        vaqueiro: vaqueiros.nomeCompleto
    })
    .from(animais)
    .leftJoin(vaqueiros, eq(animais.vaqueiroId, vaqueiros.id))
    .orderBy(animais.nome);

    return { vaqueiros: allVaqueiros, animais: allAnimais };
};
