import type {Request, Response} from "express";
import {JobSchema, selectJobsByProfileId} from "./job.model.ts";
import {ProfileSchema} from "../profile/profile.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
import type {Status} from "../../utils/interfaces/Status.ts";


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