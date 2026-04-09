import { db } from './src/lib/server/db/index.ts';
import { animais, vaqueirosAnimais } from './src/lib/server/db/schema.ts';
import { isNotNull } from 'drizzle-orm';

async function migrate() {
    console.log('Starting migration...');
    const existingAnimais = await db.select().from(animais).where(isNotNull(animais.vaqueiroId));
    
    console.log(`Found ${existingAnimais.length} animals with vaqueiroId.`);
    
    for (const animal of existingAnimais) {
        if (animal.vaqueiroId) {
            try {
                await db.insert(vaqueirosAnimais).values({
                    vaqueiroId: animal.vaqueiroId,
                    animalId: animal.id
                }).onConflictDoNothing();
                console.log(`Linked animal ${animal.nome} to vaqueiro ${animal.vaqueiroId}`);
            } catch (e) {
                console.error(`Error linking animal ${animal.id}:`, e);
            }
        }
    }
    console.log('Migration finished.');
}

migrate();
