import {
    deleteDocumentById,
    type Document,
    DocumentSchema,
    insertDocument,
    selectDocumentsByJobId,
    updateDocument
} from "./document.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
import type {Request, Response} from "express"
import {v7 as uuidv7} from "uuid"
import type {Status} from "../../utils/interfaces/Status.ts";
import {JobSchema} from "../job/job.model.ts";

/**
 * Creates a new document for a job.
 *
 * Validates the request body, checks session authorization, creates a new document,
 * and inserts it into the database.
 *
 * @param request - Express request object containing document data
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function postDocumentController (request: Request, response: Response): Promise<void> {
    try {
        // Validate document data in request body
        const validationResult = DocumentSchema.safeParse(request.body)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        // Destructure validated document fields
        const {documentId, documentJobId, documentCreatedAt, documentFileUrl, documentLabel} = validationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
        // Create new document object with generated documentId
        const document: Document = {
            documentId: uuidv7(),
            documentJobId,
            documentCreatedAt,
            documentFileUrl,
            documentLabel,
        }
        const result = await insertDocument(document)
        const status: Status = {status: 200, message: result, data: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Updates an existing document for a job.
 *
 * Validates the request params and body, checks session authorization,
 * and updates the document in the database.
 *
 * @param request - Express request object containing document data and params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function putDocumentController (request: Request, response: Response): Promise<void> {
    try {
        // Validate documentId in request params
        const paramsValidationResult = DocumentSchema.pick({documentId: true}).safeParse(request.params)
        // Validate document data in request body
        const bodyValidationResult = DocumentSchema.safeParse(request.body)

        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!bodyValidationResult.success) {
            zodErrorResponse(response, bodyValidationResult.error)
            return
        }

        // Destructure validated document fields
        const {documentId} = paramsValidationResult.data
        const {documentJobId, documentCreatedAt, documentFileUrl, documentLabel} = bodyValidationResult.data

        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
        // Create updated document object
        const document: Document = {
            documentId,
            documentJobId,
            documentCreatedAt,
            documentFileUrl,
            documentLabel,
        }
        const result = await updateDocument(document)
        const status: Status = {status: 200, message: result, data: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Retrieves all documents for a given job.
 *
 * Validates the jobId from request params, fetches documents from the database,
 * and returns them in the response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function getDocumentController (request: Request, response: Response): Promise<void> {
    try {
        // Validate jobId in request params
        const validationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId} = validationResult.data
        // Fetch documents for the job
        const result = await selectDocumentsByJobId(jobId)
        const status: Status = {status: 200, message: null, data: result}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Deletes a document by its documentId.
 *
 * Validates the documentId from request params, checks session authorization,
 * deletes the document from the database, and returns a status response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function deleteDocumentController (request: Request, response: Response): Promise<void> {
    try {
        // Validate documentId in request params
        const validationResult = DocumentSchema.pick({documentId: true}).safeParse(request.params)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {documentId} = validationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
        // Delete document from the database
        const result = await deleteDocumentById(documentId)
        const status: Status = {status: 200, message: result, data: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}