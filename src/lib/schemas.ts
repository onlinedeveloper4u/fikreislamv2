import { z } from 'zod';

export const MediaItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mediaType: z.enum(['audio', 'video', 'book', 'text']),
  speaker: z.string().min(1, "Speaker is required"),
  collection: z.string().min(1, "Collection is required"),
  subcollection: z.string().min(1, "Subcollection is required"),
  archiveUrl: z.string().url("Invalid archive URL"),
  fileSize: z.string().optional(),
  duration: z.string().optional(),
  createdAt: z.date().optional().default(() => new Date()),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;
