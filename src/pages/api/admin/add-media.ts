import type { APIRoute } from 'astro';
import clientPromise from '../../../lib/mongodb';
import { MediaItemSchema } from '../../../lib/schemas';
import { getSession } from 'auth-astro/server';

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  const adminEmail = import.meta.env.ADMIN_EMAIL || 'admin@fikreislam.com';

  // Double-check security
  if (!session || session.user?.email !== adminEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate with Zod
    const validatedData = MediaItemSchema.parse(body);

    // Get DB and collection
    const client = await clientPromise;
    const db = client.db('fikreislam');
    const collection = db.collection('media_catalog');

    // Insert document
    const result = await collection.insertOne({
      ...validatedData,
      createdAt: validatedData.createdAt || new Date(),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Media item added successfully',
      id: result.insertedId 
    }), { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        details: error.message 
      }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
