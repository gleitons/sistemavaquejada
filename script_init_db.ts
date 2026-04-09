import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: 'file:local.db',
});

async function main() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS senhas (
        id TEXT PRIMARY KEY,
        numero INTEGER NOT NULL,
        status TEXT DEFAULT 'disponivel',
        data_competicao TEXT,
        vaqueiro_puxador_id TEXT,
        animal_puxador_id TEXT,
        vaqueiro_esteira_id TEXT,
        animal_esteira_id TEXT,
        created_at INTEGER,
        FOREIGN KEY (vaqueiro_puxador_id) REFERENCES vaqueiros(id),
        FOREIGN KEY (animal_puxador_id) REFERENCES animais(id),
        FOREIGN KEY (vaqueiro_esteira_id) REFERENCES vaqueiros(id),
        FOREIGN KEY (animal_esteira_id) REFERENCES animais(id)
      );
    `);
    console.log('Tabela senhas criada com sucesso!');
  } catch (e) {
    console.error('Erro ao criar tabela:', e);
  } finally {
    client.close();
  }
}

main();
