import { getDb } from './src/lib/db';

async function run() {
  const db = await getDb();
  console.log("Speaker:");
  console.log(await db.collection('speakers').findOne({}));
  console.log("\nAudio Type:");
  console.log(await db.collection('audio_types').findOne({}));
  process.exit(0);
}

run();
