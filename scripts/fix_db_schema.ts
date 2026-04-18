import { createClient } from '@libsql/client';

async function fixSchema() {
    const client = createClient({ url: 'file:local.db' });
    try {
        console.log('Starting migration to make vaqueiro_id nullable...');
        
        await client.execute('PRAGMA foreign_keys=OFF;');
        
        await client.execute('BEGIN TRANSACTION;');

        // 1. Create temporary table
        await client.execute(`
            CREATE TABLE IF NOT EXISTS animais_new (
                id TEXT PRIMARY KEY,
                nome TEXT NOT NULL,
                cor TEXT,
                raca TEXT,
                data_nascimento TEXT,
                peso REAL,
                categoria TEXT,
                pai TEXT,
                mae TEXT,
                valor_real REAL,
                vaqueiro_id TEXT REFERENCES vaqueiros(id),
                created_at INTEGER
            );
        `);

        // 2. Copy data
        console.log('Copying data to new table...');
        await client.execute('INSERT INTO animais_new SELECT id, nome, cor, raca, data_nascimento, peso, categoria, pai, mae, valor_real, vaqueiro_id, created_at FROM animais;');

        // 3. Drop old table
        console.log('Dropping old table...');
        await client.execute('DROP TABLE animais;');

        // 4. Rename new table
        console.log('Renaming new table...');
        await client.execute('ALTER TABLE animais_new RENAME TO animais;');

        await client.execute('COMMIT;');
        await client.execute('PRAGMA foreign_keys=ON;');
        
        console.log('Migration completed successfully!');
        
        // Final check
        const result = await client.execute("PRAGMA table_info(animais);");
        console.log('New schema info:');
        console.log(JSON.stringify(result.rows, null, 2));

    } catch (e: any) {
        console.error('Migration failed:', e.message);
        try {
            await client.execute('ROLLBACK;');
        } catch (rollbackError) {}
    }
}

fixSchema();
