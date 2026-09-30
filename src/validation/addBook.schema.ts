import { z } from 'zod';

export const AddBookSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),

  content: z
    .string()
    .min(20, 'Content must be at least 20 characters'),

      images: z
    .array(z.string())
    .min(1, 'At least one image is required'),
});

export type AddBookForm = z.infer<typeof AddBookSchema>;