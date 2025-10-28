import type {Request, Response} from "express";
import {
    deleteJobByJobId,
    deleteJobNote, getWeeklyApplications,
    insertJob, insertJobNote,
    type Job, type JobNote, JobNoteSchema,
    JobSchema, selectJobAndJobNoteByJobId, selectJobByRecentlyAdded, selectJobNotesByJobId,
    selectJobsByProfileId,
    updateJob, updateJobNote
} from "./job.model.ts";
import {ProfileSchema} from "../profile/profile.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
import type {Status} from "../../utils/interfaces/Status.ts";
import {v7 as uuidv7} from "uuid"
import {deleteRemindersByJobId} from "../reminder/reminder.model.ts";


/**
 * Retrieves all jobs for a given profile.
 *
 * Validates the profileId from request params, fetches jobs from the database,
 * and returns them in the response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function getAllJobsController(request: Request, response: Response): Promise<void> {
    try {
        // Validate profileId in request params
        const validationResult = ProfileSchema.pick({profileId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {profileId} = validationResult.data
        // Fetch jobs for the profile
        const data = await selectJobsByProfileId(profileId)
        const status: Status = {status: 200, data, message: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Creates a new job for the logged-in user.
 *
 * Validates the request body, checks session authorization, creates a new job,
 * and inserts it into the database.
 *
 * @param request - Express request object containing job data
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function postJobController(request: Request, response: Response): Promise<void> {
    try {
        // Validate job data in request body
        const validationResult = JobSchema.safeParse(request.body)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        // Destructure validated job fields
        const {jobId, jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId, jobSalaryMin, jobSalaryMax} = validationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Create new job object with generated jobId and session profileId
        const job: Job = {jobId: uuidv7(), jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId: profileIdFromSession, jobSalaryMin, jobSalaryMax}
        const result: string = await insertJob(job)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Updates an existing job for the logged-in user.
 *
 * Validates the request body and params, checks session authorization,
 * and updates the job in the database.
 *
 * @param request - Express request object containing job data and params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function putJobController(request: Request, response: Response): Promise<void> {
    try {
        // Validate job data in request body
        const validationResult = JobSchema.safeParse(request.body)
        // Validate jobId in request params
        const validationParamsResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationParamsResult.success) {
            zodErrorResponse(response, validationParamsResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        // Destructure validated job fields
        const {jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt,  jobSalaryMin, jobSalaryMax} = validationResult.data
        const {jobId} = validationParamsResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Create updated job object
        const job: Job = {jobId, jobCompany, jobAppliedOn, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSource, jobStatus, jobUpdatedAt, jobProfileId: profileIdFromSession, jobSalaryMin, jobSalaryMax}
        const result: string = await updateJob(job)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Creates a new job note for a job.
 *
 * Validates the request body and params, checks session authorization,
 * and inserts the job note into the database.
 *
 * @param request - Express request object containing job note data and params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function postJobNoteController(request: Request, response: Response): Promise<void> {
    try {
        // Validate job note data in request body
        const validationResult = JobNoteSchema.safeParse(request.body)
        // Validate jobId in request params
        const paramsValidationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        // Destructure validated job note fields
        const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = validationResult.data
        const {jobId} = paramsValidationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Create new job note object with generated jobNoteId and param jobId
        const jobNote: JobNote = {jobNoteId: uuidv7(), jobNoteJobId: jobId, jobNoteText, jobNoteCreatedAt}
        const result: string = await insertJobNote(jobNote)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Updates an existing job note for a job.
 *
 * Validates the request body and params, checks session authorization,
 * and updates the job note in the database.
 *
 * @param request - Express request object containing job note data and params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function putJobNoteController(request: Request, response: Response): Promise<void> {
    try {
        // Validate job note data in request body
        const validationResult = JobNoteSchema.safeParse(request.body)
        // Validate jobNoteId in request params
        const paramsValidationResult = JobNoteSchema.pick({jobNoteId: true}).safeParse(request.params)
        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        // Destructure validated job note fields
        const {jobNoteJobId, jobNoteText, jobNoteCreatedAt} = validationResult.data
        const {jobNoteId} = paramsValidationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Create updated job note object
        const jobNote: JobNote = {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt}
        const result: string = await updateJobNote(jobNote)
        response.json({status: 200, data: null, message: result})
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Retrieves all job notes for a given job.
 *
 * Validates the jobId from request params, checks session authorization,
 * fetches job notes from the database, and returns them in the response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function getJobNotesController(request: Request, response: Response): Promise<void> {
    try {
        // Validate jobId in request params
        const validationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId} = validationResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Fetch job notes for the job
        const data = await selectJobNotesByJobId(jobId)
        const status: Status = {status: 200, data, message: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function getJobsByRecentlyAddedController(request: Request, response: Response): Promise<void> {
    try {
        // Validate profileId in request params
        const validationResult = ProfileSchema.pick({profileId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {profileId} = validationResult.data
        // Fetch jobs for the profile
        const data = await selectJobByRecentlyAdded(profileId)
        const status: Status = {status: 200, data, message: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

/**
 * Deletes a job and all its notes.
 *
 * Validates the jobId from request params, checks session authorization,
 * deletes all job notes and the job itself from the database, and returns a status response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function deleteJobController(request: Request, response: Response): Promise<void> {
    try {
        // Validate jobId in request params
        const validationParamsResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationParamsResult.success) {
            zodErrorResponse(response, validationParamsResult.error)
            return
        }
        const {jobId} = validationParamsResult.data
        // Get profile from session for authorization
        const profile = request.session?.profile
        const profileIdFromSession = profile?.profileId
        if(profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null })
            return
        }
        // Delete all job notes for the job
        const jobRemindersDelete = await deleteRemindersByJobId(jobId)
        const jobNoteDelete = await deleteJobNote(jobId)
        // Delete the job itself
        const result = await deleteJobByJobId(jobId)
        const status: Status = {status: 200, data: null, message: result}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}
/** * Retrieves a job and all its notes by jobId.
 *
 * Validates the jobId from request params, checks session authorization,
 * fetches the job and its notes from the database, and returns them in the response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */

export async function getJobAndJobNoteController(request: Request, response: Response): Promise<void> {
    try {
        // Validate jobId in request params
        const validationResult = JobSchema.pick({jobId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {jobId} = validationResult.data

        const result = await selectJobAndJobNoteByJobId(jobId)
        const status: Status = {status: 200, data: result, message: null}
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}

export async function getWeeklyApplicationsController(request: Request, response: Response): Promise<void> {
    try {
        const paramsValidation = ProfileSchema.pick({ profileId: true }).safeParse(request.params);
        if (!paramsValidation.success) {
            zodErrorResponse(response, paramsValidation.error);
            return;
        }
        const { profileId } = paramsValidation.data;

        // Optional auth check (follow your existing pattern)
        const profile = request.session?.profile;
        const profileIdFromSession = profile?.profileId;
        if (profileIdFromSession === undefined || profileIdFromSession === null) {
            response.json({ status: 401, message: 'Unauthorized, please log in', data: null });
            return;
        }
        // (Optional) If you want to ensure users can only fetch their own data, enforce:
        // if (profileIdFromSession !== profileId) {
        //   response.json({ status: 403, message: 'Forbidden', data: null });
        //   return;
        // }

        // Read ?weeks=... and clamp to [1, 12]
        const rawWeeks = Number(request.query.weeks);
        const weeks = Math.max(1, Math.min(12, Number.isFinite(rawWeeks) ? rawWeeks : 4));

        // Fetch weekly applications
        const data = await getWeeklyApplications(profileId, weeks);

        const status: Status = { status: 200, data, message: null };
        response.json(status);
    } catch (error) {
        console.error(error);
        serverErrorResponse(response, null);

    }
}