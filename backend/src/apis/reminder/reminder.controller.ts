import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
import type {Request, Response} from "express"
import {v7 as uuidv7} from "uuid"
import type {Status} from "../../utils/interfaces/Status.ts";
import {
    deleteReminder,
    insertReminder,
    type Reminder,
    ReminderSchema,
    selectRemindersByJobId,
    updateReminder
} from "./reminder.model.ts";


/**
 * Creates a new reminder for a job.
 *
 * Validates the request body, checks session authorization, creates a new reminder,
 * and inserts it into the database.
 *
 * @param request - Express request object containing reminder data
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function postReminderController (request: Request, response: Response): Promise<void>  {
    try {
        // Validate reminder data in request body
        const validationResult = ReminderSchema.safeParse(request.body);
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error);
            return;
        }
        // Destructure validated reminder fields
        const { reminderId, reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel } = validationResult.data;
        // Get profile from session for authorization
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
        // Create new reminder object with generated reminderId
        const reminder: Reminder = {
            reminderId: uuidv7(),
            reminderJobId,
            reminderAt,
            reminderCreatedAt,
            reminderDone,
            reminderLabel
        }
        const result = await insertReminder(reminder);
        const status: Status = { status: 200, message: result, data: null };
        response.json(status);
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        serverErrorResponse(response, null);
    }
}

/**
 * Updates an existing reminder for a job.
 *
 * Validates the request params and body, checks session authorization,
 * and updates the reminder in the database.
 *
 * @param request - Express request object containing reminder data and params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function putReminderController (request: Request, response: Response): Promise<void> {
    try {
        // Validate reminderId in request params
        const paramsValidationResult = ReminderSchema.pick({ reminderId: true }).safeParse(request.params);
        // Validate reminder data in request body
        const validationResult = ReminderSchema.safeParse(request.body);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error);
            return;
        }
        // Destructure validated reminder fields
        const { reminderId } = paramsValidationResult.data;
        const { reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel } = validationResult.data;
        // Get profile from session for authorization
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
        // Create updated reminder object
        const reminder: Reminder = {
            reminderId,
            reminderJobId,
            reminderAt,
            reminderCreatedAt,
            reminderDone,
            reminderLabel
        }
        const result = await updateReminder(reminder)
        const status: Status = { status: 200, message: result, data: null };
        response.json(status);
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        serverErrorResponse(response, null);
    }
}

/**
 * Retrieves all reminders for a given job.
 *
 * Validates the reminderJobId from request params, checks session authorization,
 * fetches reminders from the database, and returns them in the response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function getRemindersByJobIdController (request: Request, response: Response): Promise<void> {
    try {
        // Validate reminderJobId in request params
        const paramsValidationResult = ReminderSchema.pick({ reminderJobId: true }).safeParse(request.params);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        const { reminderJobId } = paramsValidationResult.data;
        // Get profile from session for authorization
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
        // Fetch reminders for the job
        const data = await selectRemindersByJobId(reminderJobId)
        const status: Status = { status: 200, message: null, data };
        response.json(status);
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        serverErrorResponse(response, null);
    }
}

/**
 * Deletes a reminder by its reminderId.
 *
 * Validates the reminderId from request params, checks session authorization,
 * deletes the reminder from the database, and returns a status response.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function deleteReminderController (request: Request, response: Response): Promise<void> {
    try {
        // Validate reminderId in request params
        const paramsValidationResult = ReminderSchema.pick({reminderId: true }).safeParse(request.params);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        const { reminderId } = paramsValidationResult.data;
        // Get profile from session for authorization
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
        // Delete reminder from the database
        const result = await deleteReminder(reminderId)
        const status: Status = { status: 200, message: result, data: null };
        response.json(status);
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        serverErrorResponse(response, null);
    }
}