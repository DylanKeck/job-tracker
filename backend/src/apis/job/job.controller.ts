import type {Request, Response} from "express";
import {
    deleteJobByJobId,
    deleteJobNote,
    insertJob, insertJobNote,
    type Job, type JobNote, JobNoteSchema,
    JobSchema, selectJobNotesByJobId,
    selectJobsByProfileId,
    updateJob, updateJobNote
} from "./job.model.ts";
import {ProfileSchema} from "../profile/profile.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
import type {Status} from "../../utils/interfaces/Status.ts";
import {v7 as uuidv7} from "uuid"


export async function getAllJobsController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = ProfileSchema.pick({profileId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {profileId} = validationResult.data
        const data = await selectJobsByProfileId(profileId)
        const status: Status = {status: 200, data, message: null}
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function postJobController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobSchema.safeParse(request.body)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId, jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId, jobSalaryMin, jobSalaryMax} = validationResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }

        const job: Job = {jobId: uuidv7(), jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId: profileIdFromSession, jobSalaryMin, jobSalaryMax}
        const result: string = await insertJob(job)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function putJobController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobSchema.safeParse(request.body)
        const validationParamsResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationParamsResult.success) {
            zodErrorResponse(response, validationParamsResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt,  jobSalaryMin, jobSalaryMax} = validationResult.data
        const {jobId} = validationParamsResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        const job: Job = {jobId, jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId: profileIdFromSession, jobSalaryMin, jobSalaryMax}
        const result: string = await updateJob(job)
        response.json({status: 200, data: null, message: result})

    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function postJobNoteController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobNoteSchema.safeParse(request.body)
        const paramsValidationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = validationResult.data
        const {jobId} = paramsValidationResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        const jobNote: JobNote = {jobNoteId: uuidv7(), jobNoteJobId: jobId, jobNoteText, jobNoteCreatedAt}
        const result: string = await insertJobNote(jobNote)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }

}

export async function putJobNoteController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobNoteSchema.safeParse(request.body)
        const paramsValidationResult = JobNoteSchema.pick({jobNoteId: true}).safeParse(request.params)
        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobNoteJobId, jobNoteText, jobNoteCreatedAt} = validationResult.data
        const {jobNoteId} = paramsValidationResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        const jobNote: JobNote = {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt}
        const result: string = await updateJobNote(jobNote)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function getJobNotesController(request: Request, response: Response): Promise<void> {
    try {
        const validationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId} = validationResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        const data = await selectJobNotesByJobId(jobId)
        const status: Status = {status: 200, data, message: null}
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}


export async function deleteJobController(request: Request, response: Response): Promise<void> {
    try {
        const validationParamsResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationParamsResult.success) {
            zodErrorResponse(response, validationParamsResult.error)
            return
        }
        const {jobId} = validationParamsResult.data
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        const jobNoteDelete = await deleteJobNote(jobId)
        const result = await deleteJobByJobId(jobId)
        const status: Status = {status: 200, data: null, message: result}
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}
