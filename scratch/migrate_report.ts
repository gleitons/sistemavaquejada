import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

async function run() {
  try {
    console.log('Running migration...');
    await client.execute('ALTER TABLE senhas ADD COLUMN data_cadastro INTEGER;');
    console.log('Migration successful!');
  } catch (e: any) {
    if (e.message.includes('duplicate column name')) {
      console.log('Column already exists, skipping.');
    } else {
      console.error('Migration failed:', e.message);
    }
  } finally {
    process.exit();
  }
}

run();
