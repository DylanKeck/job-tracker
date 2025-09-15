import z from "zod/v4";

export const DocumentSchema =
    z.object({
        documentId: z.uuidv7('please provide a valid uuid7 for documentId'),
        documentJobId: z.uuidv7('please provide a valid uuid7 for documentJobId'),
        documentCreatedAt: z.coerce.date('please provide a valid date for documentCreatedAt'),
        documentFileUrl: z.string('Please provide a valid string for documentFileUrl')
            .max(255, 'please keep it under 255 characters')
            .trim(),
        documentLabel: z.string('Please provide a valid string for documentLabel')
            .max(50, 'please keep it under 50 characters')
            .trim(),
    })

export type Document = z.infer<typeof DocumentSchema>;