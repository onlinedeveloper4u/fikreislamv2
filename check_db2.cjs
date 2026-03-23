const { MongoClient } = require('./node_modules/mongodb');
require('dotenv').config({ path: '/Users/muhammadaqib51/Projects/fikreislam/user-portal/.env' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('fikreislam');
    console.log("Audio Types:");
    const types = await db.collection('audio_types').find({}).toArray();
    console.log(types);
  } finally {
    await client.close();
  }
}
run();
