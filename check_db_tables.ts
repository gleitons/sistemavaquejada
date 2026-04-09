import { createClient } from '@libsql/client';
import fs from 'fs';

async function checkDB() {
    const client = createClient({ url: 'file:local.db' });
    try {
        const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table";');
        fs.writeFileSync('db_check.txt', 'Tables:\n' + JSON.stringify(result.rows, null, 2));
        
        const columnCheck = await client.execute('PRAGMA table_info(animais);');
        fs.appendFileSync('db_check.txt', '\n\nAnimais Columns:\n' + JSON.stringify(columnCheck.rows, null, 2));

        const vaqAnCheck = await client.execute('SELECT COUNT(*) as count FROM vaqueiros_animais;');
        fs.appendFileSync('db_check.txt', '\n\nVaqueirosAnimais Count:\n' + JSON.stringify(vaqAnCheck.rows, null, 2));
        
    } catch (e) {
        fs.writeFileSync('db_check.txt', 'DB Check Error: ' + e.message);
    }
}

checkDB();
