import { z } from "zod"

export const gemFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(80, "Title must be 80 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(180, "Description must be 180 characters or less"),
  url: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL")
    .refine((val) => val.startsWith("http://") || val.startsWith("https://"), {
      message: "URL must start with http:// or https://",
    }),
  previewImageUrl: z
    .string()
    .min(1, "Preview image URL is required")
    .refine(
      (val) =>
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      { message: "Must be a valid URL or a local path starting with /" }
    ),
  published: z.boolean(),
})

export type GemFormValues = z.infer<typeof gemFormSchema>
