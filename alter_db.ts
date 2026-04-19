import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({ url: 'file:local.db' });
  try {
    console.log("Altering vaqueiros table...");
    await client.execute(`ALTER TABLE vaqueiros ADD COLUMN genero TEXT;`);
    console.log("Vaqueiros updated");
  } catch (e: any) {
    console.log("Vaqueiros already has genero or error:", e.message);
  }

  try {
    console.log("Altering animais table...");
    await client.execute(`ALTER TABLE animais ADD COLUMN sexo TEXT;`);
    console.log("Animais updated");
  } catch (e: any) {
    console.log("Animais already has sexo or error:", e.message);
  }

  console.log("Done");
}

main();
