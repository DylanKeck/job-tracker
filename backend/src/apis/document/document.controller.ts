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



export async function postDocumentController (request: Request, response: Response): Promise<void> {
    try {
        const validationResult = DocumentSchema.safeParse(request.body)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {documentId, documentJobId, documentCreatedAt, documentFileUrl, documentLabel} = validationResult.data
        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
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
        console.error(error)
        serverErrorResponse(response, null)
    }

}

export async function putDocumentController (request: Request, response: Response): Promise<void> {
    try {
        const paramsValidationResult = DocumentSchema.pick({documentId: true}).safeParse(request.params)
        const bodyValidationResult = DocumentSchema.safeParse(request.body)

        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!bodyValidationResult.success) {
            zodErrorResponse(response, bodyValidationResult.error)
            return
        }

        const {documentId} = paramsValidationResult.data
        const {documentJobId, documentCreatedAt, documentFileUrl, documentLabel} = bodyValidationResult.data

        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
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
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function getDocumentController (request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId} = validationResult.data
        console.log("jobId", jobId)
        const result = await selectDocumentsByJobId(jobId)
        const status: Status = {status: 200, message: null, data: result}
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function deleteDocumentController (request: Request, response: Response): Promise<void> {
    try {
        const validationResult = DocumentSchema.pick({documentId: true}).safeParse(request.params)
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {documentId} = validationResult.data
        const profile = request.session?.profile
        const profileId = profile?.profileId
        if (!profileId) {
            response.json({status: 400, message: 'you are not allowed to preform this task', data: null})
            return
        }
        const result = await deleteDocumentById(documentId)
        const status: Status = {status: 200, message: result, data: null}
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}