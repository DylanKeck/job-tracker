import type {Request, Response} from "express";
import {type Profile, ProfileSchema, selectProfileByProfileEmail} from "../profile/profile.model.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";
import {z} from "zod/v4";
import {generateJwt, validatePassword} from "../../utils/auth.utils.ts";
import {v7 as uuidv7} from "uuid"
import type {Status} from "../../utils/interfaces/Status.ts";


export async function signInController (request: Request, response: Response): Promise<void> {
    try {
        const validationResult = ProfileSchema
            .pick({profileEmail: true})
            .extend({
                profilePassword: z.string('Password is required')
                    .min(8, 'Password must be at least 8 characters')
                    .max(32, 'Password must be at most 32 characters')
            })
            .safeParse(request.body)

        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }

        const {profileEmail, profilePassword} = validationResult.data
        const profile: Profile | null = await selectProfileByProfileEmail(profileEmail)
        const signInFailedStatus: Status = {status: 400, message: 'Email or password is incorrect', data: null}
        if (profile === null) {
            response.json(signInFailedStatus)
            return
        }

        const isPasswordValid = await validatePassword(profile.profilePasswordHash, profilePassword)
        if (!isPasswordValid) {
            response.json(signInFailedStatus)
            return
        }

        if(profile.profileActivationToken !== null) {
            response.json({status: 400, message: 'Account is not activated. Please check your email for the activation link.', data: null})
            return
        }

        const {profileId, profileUsername, profileLocation, profileCreatedAt, profileResumeUrl} = profile

        const signature: string = uuidv7()
        const authorization: string = generateJwt({
            profileId,
            profileUsername,
            profileLocation,
            profileCreatedAt,
            profileResumeUrl,
        }, signature)

        request.session.profile = profile
        request.session.jwt = authorization
        request.session.signature = signature

        response.header ({
            authorization
        })

        response.json({status: 200, message: 'Sign-in successful', data: null})
        return
    } catch (error:any) {
        console.error(error)
        response.json({ status: 500, data: null, message: error.message})
    }
}