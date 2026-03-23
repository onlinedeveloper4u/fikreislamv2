import { getDb } from './src/lib/db';

async function run() {
  const db = await getDb();
  console.log("Languages:");
  const languages = await db.collection('languages').find({}).toArray();
  console.log(JSON.stringify(languages, null, 2));

  console.log("Audio Types:");
  const at = await db.collection('audio_types').find({}).toArray();
  console.log(JSON.stringify(at, null, 2));

  process.exit(0);
}

run();
