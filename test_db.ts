import { db } from './src/lib/server/db/index.ts';
import { vaqueiros, animais } from './src/lib/server/db/schema.ts';
import { isNotNull } from 'drizzle-orm';

async function testLoadd() {
    try {
        console.log('Testing load migration check...');
        const animalsToMigrate = await db.select().from(animais).where(isNotNull(animais.vaqueiroId));
        console.log(`Found ${animalsToMigrate.length} animals to migrate.`);

        console.log('Testing query builder...');
        const list = await db.query.vaqueiros.findMany({
            with: {
                animaisAtribuidos: {
                    with: {
                        animal: true
                    }
                }
            }
        });
        console.log(`Query successful, found ${list.length} vaqueiros.`);
    } catch (e) {
        console.error('Error during test:', e);
    }
}

testLoadd();
