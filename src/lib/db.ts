/**
 * MongoDB database helper module.
 * Provides a convenient `getDb()` function to access the fikreislam database.
 */
import clientPromise from './mongodb';
import type { Db, Collection, ObjectId } from 'mongodb';

const DB_NAME = 'fikreislam';

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

/**
 * Helper to get a typed collection.
 */
export async function getCollection<T extends Document = Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

/**
 * Ensure a taxonomy value exists in the given collection.
 * If it doesn't exist, insert it.
 */
export async function ensureTaxonomy(collectionName: string, name: string): Promise<void> {
  if (!name) return;
  const db = await getDb();
  const col = db.collection(collectionName);
  const existing = await col.findOne({ name });
  if (!existing) {
    await col.insertOne({ name, created_at: new Date() });
  }
}
