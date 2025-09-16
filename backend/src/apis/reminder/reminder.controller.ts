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


export async function postReminderController (request: Request, response: Response): Promise<void>  {
    try {
        const validationResult = ReminderSchema.safeParse(request.body);
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error);
            return;
        }
        const { reminderId, reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel } = validationResult.data;
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
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
        console.error(error);
        serverErrorResponse(response, null);
    }
}

export async function putReminderController (request: Request, response: Response): Promise<void> {
    try {

        const paramsValidationResult = ReminderSchema.pick({ reminderId: true }).safeParse(request.params);
        const validationResult = ReminderSchema.safeParse(request.body);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error);
            return;
        }
        const { reminderId } = paramsValidationResult.data;
        const { reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel } = validationResult.data;
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
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
        console.error(error);
        serverErrorResponse(response, null);
    }
}

export async function getRemindersByJobIdController (request: Request, response: Response): Promise<void> {
    try {
        const paramsValidationResult = ReminderSchema.pick({ reminderJobId: true }).safeParse(request.params);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        const { reminderJobId } = paramsValidationResult.data;
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }
        const data = await selectRemindersByJobId(reminderJobId)
        const status: Status = { status: 200, message: null, data };
        response.json(status);
    } catch (error) {
        console.error(error);
        serverErrorResponse(response, null);
    }
}

export async function deleteReminderController (request: Request, response: Response): Promise<void> {
    try {
        const paramsValidationResult = ReminderSchema.pick({reminderId: true }).safeParse(request.params);
        if (!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error);
            return;
        }
        const { reminderId } = paramsValidationResult.data;
        const profile = request.session?.profile;
        const profileId = profile?.profileId;
        if (!profileId) {
            response.json({ status: 400, message: 'You are not allowed to perform this task', data: null });
            return;
        }

        const result = await deleteReminder(reminderId)
        const status: Status = { status: 200, message: result, data: null };
        response.json(status);
    } catch (error) {
        console.error(error);
        serverErrorResponse(response, null);
    }
}