import { createClient } from '@libsql/client';

async function finalFix() {
    const client = createClient({ url: 'file:local.db' });
    try {
        console.log('Creating vaqueiros_animais table...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS vaqueiros_animais (
                vaqueiro_id TEXT NOT NULL REFERENCES vaqueiros(id) ON DELETE CASCADE,
                animal_id TEXT NOT NULL REFERENCES animais(id) ON DELETE CASCADE,
                PRIMARY KEY(vaqueiro_id, animal_id)
            );
        `);

        console.log('Migrating existing links...');
        const animals = await client.execute('SELECT id, vaqueiro_id FROM animais WHERE vaqueiro_id IS NOT NULL;');
        for (const row of animals.rows) {
            await client.execute({
                sql: 'INSERT OR IGNORE INTO vaqueiros_animais (vaqueiro_id, animal_id) VALUES (?, ?);',
                args: [row.vaqueiro_id, row.id]
            });
        }
        
        console.log('Migration complete!');
    } catch (e) {
        console.error('Final Fix Error:', e.message);
    }
}

finalFix();
