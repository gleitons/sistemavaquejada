import { createClient } from '@libsql/client';

async function checkSchema() {
    const client = createClient({ url: 'file:local.db' });
    try {
        const result = await client.execute("PRAGMA table_info(animais);");
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkSchema();
