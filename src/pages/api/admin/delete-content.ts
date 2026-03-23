import type { APIRoute } from "astro";
import { getDb } from "../../../lib/db";
import { ObjectId } from "mongodb";

export const POST: APIRoute = async ({ request, locals }) => {
  // Security check: Only admins can delete
  if (locals.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return new Response("ID is required", { status: 400 });
  }

  try {
    const db = await getDb();
    const contentCollection = db.collection('content');
    
    // Find content to get IA URLs
    const item = await contentCollection.findOne({ _id: new ObjectId(id) });
    
    if (item?.file_url?.startsWith('ia://')) {
        try {
            const { deleteFromInternetArchive } = await import('../../../lib/internetArchive');
            await deleteFromInternetArchive(item.file_url);
        } catch (e) {
            console.error('Failed to delete from IA:', e);
        }
    }
    if (item?.cover_image_url?.startsWith('ia://')) {
        try {
            const { deleteFromInternetArchive } = await import('../../../lib/internetArchive');
            await deleteFromInternetArchive(item.cover_image_url);
        } catch (e) {
            console.error('Failed to delete cover from IA:', e);
        }
    }

    // Delete database record
    const result = await contentCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response("Content not found", { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(error.message || "Failed to delete", { status: 500 });
  }
};
