/** Shared TypeScript types for content from MongoDB */

export type ContentType = 'book' | 'audio' | 'video';

export interface ContentItem {
    id: string;
    _id?: string;
    title: string;
    description: string | null;
    author: string | null;
    speaker: string | null;
    type: ContentType;
    audio_type: string | null;
    language: string | null;
    tags: string[] | null;
    file_url: string | null;
    cover_image_url: string | null;
    duration: string | null;
    file_size: string | null;
    lecture_date_gregorian: string | null;
    lecture_date_hijri: string | null;
    published_at: string | null;
    categories: string[] | null;
    created_at: string;
    status: 'draft' | 'approved' | 'published';
}
