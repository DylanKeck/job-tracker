import z from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

/**
 * Zod schema for a Document object.
 *
 * Validates document data before database operations. Each field mirrors the document table schema.
 */
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

// TypeScript type inferred from DocumentSchema
export type Document = z.infer<typeof DocumentSchema>;

/**
 * Inserts a new document into the database.
 *
 * @param document - Document object validated by DocumentSchema
 * @returns Success message string
 */
export async function insertDocument(document: Document): Promise<string> {
    // Destructure document fields for SQL insert
    const {documentId, documentJobId, documentFileUrl, documentLabel} = document;
    // Insert document into the database, using now() for created timestamp
    await sql`INSERT INTO document(document_id, document_job_id, document_created_at, document_file_url, document_label) VALUES (${documentId}, ${documentJobId}, now(), ${documentFileUrl}, ${documentLabel})`;
    return 'Document added';
}

/**
 * Selects all documents for a given jobId.
 *
 * @param jobId - The job ID to filter documents by
 * @returns Array of Document objects or null if none found
 */
export async function selectDocumentsByJobId(jobId: string): Promise<Document[] | null> {
    // Query documents by jobId
    const rowList = await sql`SELECT document_id, document_job_id, document_created_at, document_file_url, document_label FROM document WHERE document_job_id = ${jobId}`;
    // Parse result using DocumentSchema array
    return DocumentSchema.array().parse(rowList);
}

/**
 * Updates an existing document in the database.
 *
 * @param document - Document object with updated fields
 * @returns Success message string
 */
export async function updateDocument(document: Document): Promise<string> {
    // Destructure document fields for SQL update
    const {documentId, documentFileUrl, documentLabel} = document;
    // Update document in the database
    await sql`UPDATE document SET document_file_url = ${documentFileUrl}, document_label = ${documentLabel} WHERE document_id = ${documentId}`;
    return 'Document updated';
}

/**
 * Deletes a document by its documentId.
 *
 * @param documentId - The document ID to delete
 * @returns Success message string
 */
export async function deleteDocumentById(documentId: string): Promise<string> {
    // Delete document from the database
    const result = await sql`DELETE FROM document WHERE document_id = ${documentId}`;
    return 'Document removed';
}