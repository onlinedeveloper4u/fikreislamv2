import { getDb } from './src/lib/db';

async function run() {
  const db = await getDb();
  const speakers = await db.collection('speakers').find({}).toArray();
  console.log("Speakers:");
  speakers.forEach(s => console.log(`'${s.name}'`));

  const content = await db.collection('content').find({}, { projection: { title: 1 } }).toArray();
  console.log("\nContent:");
  content.forEach(c => console.log(`'${c.title}'`));
  process.exit(0);
}
run();
