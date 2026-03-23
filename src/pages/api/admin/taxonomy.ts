import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { ObjectId } from "mongodb";

export const POST: APIRoute = async ({ request, locals }) => {
  if (locals.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { action, table, name, id } = await request.json();

    if (!table || !['speakers', 'categories', 'languages', 'audio_types'].includes(table)) {
        return new Response("Invalid table", { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection(table);

    if (action === 'add') {
        if (!name) return new Response("Name is required", { status: 400 });
        // Check if already exists
        const existing = await collection.findOne({ name });
        if (existing) {
            return new Response("Already exists", { status: 409 });
        }
        await collection.insertOne({ name, created_at: new Date() });
    } else if (action === 'delete') {
        if (!id) return new Response("ID is required", { status: 400 });
        await collection.deleteOne({ _id: new ObjectId(id) });
    } else {
        return new Response("Invalid action", { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(error.message || "Failed to process taxonomy request", { status: 500 });
  }
};
