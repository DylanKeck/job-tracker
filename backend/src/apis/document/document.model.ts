import z from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

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

export async function insertDocument(document: Document): Promise<string> {
    const {documentId, documentJobId, documentFileUrl, documentLabel} = document;
    await sql`INSERT INTO document(document_id, document_job_id, document_created_at, document_file_url, document_label) VALUES (${documentId}, ${documentJobId}, now(), ${documentFileUrl}, ${documentLabel})`;
    return 'Document added';
}

export async function selectDocumentsByJobId(jobId: string): Promise<Document[] | null> {
    const rowList = await sql`SELECT document_id, document_job_id, document_created_at, document_file_url, document_label FROM document WHERE document_job_id = ${jobId}`;
    return DocumentSchema.array().parse(rowList);
}

export async function updateDocument(document: Document): Promise<string> {
    const {documentId, documentFileUrl, documentLabel} = document;
    await sql`UPDATE document SET document_file_url = ${documentFileUrl}, document_label = ${documentLabel} WHERE document_id = ${documentId}`;
    return 'Document updated';
}

export async function deleteDocumentById(documentId: string): Promise<string> {
    const result = await sql`DELETE FROM document WHERE document_id = ${documentId}`;
    return 'Document removed';
}