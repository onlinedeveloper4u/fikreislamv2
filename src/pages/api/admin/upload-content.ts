import type { APIRoute } from "astro";
import { getDb, ensureTaxonomy } from "../../../lib/db";
import { ObjectId } from "mongodb";
import { uploadToInternetArchive } from "../../../lib/internetArchive";

export const POST: APIRoute = async ({ request, locals }) => {
  // Security check
  if (locals.role !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const speaker = formData.get("speaker")?.toString();
    const audioType = formData.get("audioType")?.toString();
    const language = formData.get("language")?.toString();
    const status = formData.get("status")?.toString() || "published";
    
    // New fields
    const storageProvider = formData.get("storageProvider")?.toString() || "internet-archive";
    const durH = formData.get("durHours")?.toString() || "00";
    const durM = formData.get("durMinutes")?.toString() || "00";
    const durS = formData.get("durSeconds")?.toString() || "00";
    const duration = `${durH.padStart(2, '0')}:${durM.padStart(2, '0')}:${durS.padStart(2, '0')}`;

    const venueManual = formData.get("venueManual")?.toString();
    const vDistrict = formData.get("venueDistrict")?.toString();
    const vTehsil = formData.get("venueTehsil")?.toString();
    const vCity = formData.get("venueCity")?.toString();
    const vArea = formData.get("venueArea")?.toString();
    const venue = venueManual || [vDistrict, vTehsil, vCity, vArea].filter(Boolean).join(', ');

    const rawCategories = formData.get("categories")?.toString() || "";
    const categoryList = rawCategories.split(',').map(c => c.trim()).filter(Boolean);

    const gDay = formData.get("gDay")?.toString();
    const gMonth = formData.get("gMonth")?.toString();
    const gYear = formData.get("gYear")?.toString();
    const gDate = (gYear && gMonth && gDay) ? `${gYear}-${gMonth.padStart(2, '0')}-${gDay.padStart(2, '0')}` : null;

    const hDay = formData.get("hDay")?.toString();
    const hMonth = formData.get("hMonth")?.toString();
    const hYear = formData.get("hYear")?.toString();

    // Ensure all taxonomies exist in MongoDB
    const db = await getDb();
    
    let speakerIdStr;
    if (speaker) {
        let speakerDoc = await db.collection('speakers').findOne({ name: speaker });
        if (!speakerDoc) {
            const result = await db.collection('speakers').insertOne({ name: speaker, created_at: new Date() });
            speakerIdStr = result.insertedId.toString();
        } else {
            speakerIdStr = speakerDoc._id.toString();
        }
    }

    if (audioType) {
        let audioTypeDoc = await db.collection('audio_types').findOne({ name: audioType });
        if (!audioTypeDoc) {
            await db.collection('audio_types').insertOne({ 
                name: audioType, 
                speaker_id: speakerIdStr, 
                created_at: new Date() 
            });
        }
    }

    if (language) await ensureTaxonomy('languages', language);
    for (const cat of categoryList) {
        await ensureTaxonomy('categories', cat);
    }

    if (!title) {
        return new Response("Title is required", { status: 400 });
    }

    let audioUrl = formData.get("existingAudioUrl")?.toString();
    let coverUrl = formData.get("existingCoverUrl")?.toString();

    // Handle File Uploads to Internet Archive
    const audioFile = formData.get("audioFile") as File | null;
    const coverFile = formData.get("coverFile") as File | null;
    
    // Extract existing identifier if any from current URLs
    let currentIdentifier: string | undefined = undefined;
    if (audioUrl?.startsWith('ia://')) {
        currentIdentifier = audioUrl.replace('ia://', '').split('/')[0];
    } else if (coverUrl?.startsWith('ia://')) {
        currentIdentifier = coverUrl.replace('ia://', '').split('/')[0];
    }

    if (audioFile && audioFile.size > 0) {
        try {
            const uploadResult = await uploadToInternetArchive(audioFile, {
                speaker: speaker || 'Unknown',
                audioType: audioType || 'Audio',
                title: title,
                existingIdentifier: currentIdentifier
            });
            audioUrl = uploadResult.iaUrl;
            currentIdentifier = uploadResult.identifier;
        } catch (err: any) {
            console.error('IA Audio Upload Error:', err);
            return new Response(`IA Upload Error: ${err.message}`, { status: 500 });
        }
    }

    if (coverFile && coverFile.size > 0) {
        try {
            const uploadResult = await uploadToInternetArchive(coverFile, {
                speaker: speaker || 'Unknown',
                audioType: 'Image',
                title: `${title} - Cover`,
                existingIdentifier: currentIdentifier
            });
            coverUrl = uploadResult.iaUrl;
        } catch (err: any) {
            console.error('IA Cover Upload Error:', err);
        }
    }

    // Note: File uploads to Supabase storage have been removed.
    // Files should be uploaded to Internet Archive or Google Drive separately.
    // The form now only stores the URL references.

    const contentCollection = db.collection('content');

    // Filter and sanitize data fields to only requested columns and avoid empty strings
    const contentData: any = {
        title: title || null,
        speaker: speaker || null,
        audio_type: audioType || null,
        language: language || null,
        file_url: audioUrl || null,
        cover_image_url: coverUrl || null,
        duration: duration || null,
        venue: (venue && venue.trim().length > 0) ? venue : null,
        categories: categoryList,
        lecture_date_gregorian: gDate || null,
        hijri_date_day: hDay ? parseInt(hDay) : null,
        hijri_date_month: hMonth || null,
        hijri_date_year: hYear ? parseInt(hYear) : null,
        updated_at: new Date().toISOString()
    };

    if (id) {
        // Update existing
        await contentCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: contentData }
        );
    } else {
        // Insert new
        await contentCollection.insertOne({
            ...contentData,
            created_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(error.message || "Failed to process request", { status: 500 });
  }
};
