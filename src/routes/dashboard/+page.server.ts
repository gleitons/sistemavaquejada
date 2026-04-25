import { db } from '$lib/server/db';
import { vaqueiros, animais, senhas } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

export const load = async () => {
    try {
        const [numVaqueiros] = await db.select({ value: count() }).from(vaqueiros);
        const [numAnimais] = await db.select({ value: count() }).from(animais);
        const [numSenhas] = await db.select({ value: count() }).from(senhas);

        return {
            stats: {
                vaqueiros: numVaqueiros.value,
                animais: numAnimais.value,
                senhas: numSenhas.value,
                competicoes: 1, 
                premios: "R$ 50.000,00"
            }
        };
    } catch (e: any) {
        console.error('SERVER LOAD ERROR (dashboard):', e);
        return {
            stats: {
                vaqueiros: 0,
                animais: 0,
                senhas: 0,
                competicoes: 0,
                premios: "Indisponível (Offline)"
            }
        };
    }
};
