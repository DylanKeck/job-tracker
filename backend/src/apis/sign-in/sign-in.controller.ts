import type {Request, Response} from "express";
import {type Profile, ProfileSchema, selectProfileByProfileEmail} from "../profile/profile.model.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";
import {z} from "zod/v4";
import {generateJwt, validatePassword} from "../../utils/auth.utils.ts";
import {v7 as uuidv7} from "uuid"
import type {Status} from "../../utils/interfaces/Status.ts";

/**
 * Controller for handling user sign-in requests.
 *
 * This function validates the incoming request body for email and password, checks the user's credentials,
 * manages session and JWT creation, and returns appropriate responses for success or failure.
 *
 * @param request - Express request object containing user credentials
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function signInController (request: Request, response: Response): Promise<void> {
    try {
        // Validate request body for email and password using Zod schema
        const validationResult = ProfileSchema
            .pick({profileEmail: true})
            .extend({
                profilePassword: z.string('Password is required')
                    .min(8, 'Password must be at least 8 characters')
                    .max(32, 'Password must be at most 32 characters')
            })
            .safeParse(request.body)

        // If validation fails, send error response and exit
        if (!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }

        // Extract validated email and password
        const {profileEmail, profilePassword} = validationResult.data
        // Attempt to find the profile by email
        const profile: Profile | null = await selectProfileByProfileEmail(profileEmail)
        // Standard error response for failed sign-in
        const signInFailedStatus: Status = {status: 400, message: 'Email or password is incorrect', data: null}
        if (profile === null) {
            // If no profile found, return error
            response.json(signInFailedStatus)
            return
        }

        // Validate the provided password against the stored hash
        const isPasswordValid = await validatePassword(profile.profilePasswordHash, profilePassword)
        if (!isPasswordValid) {
            // If password is invalid, return error
            response.json(signInFailedStatus)
            return
        }

        // Check if the account is activated
        if(profile.profileActivationToken !== null) {
            response.json({status: 400, message: 'Account is not activated. Please check your email for the activation link.', data: null})
            return
        }

        // Destructure profile fields for JWT payload
        const {profileId, profileUsername, profileLocation, profileCreatedAt, profileResumeUrl} = profile

        // Generate a unique signature and JWT token
        const signature: string = uuidv7()
        const authorization: string = generateJwt({
            profileId,
            profileEmail,
            profileUsername,
            profileLocation,
            profileCreatedAt,
            profileResumeUrl,
        }, signature)

        // Store profile and JWT in session
        request.session.profile = profile
        request.session.jwt = authorization
        request.session.signature = signature

        // Set authorization header in response
        response.header ({
            authorization
        })

        // Send success response
        response.json({status: 200, message: 'Sign-in successful', data: null})
        return
    } catch (error:any) {
        // Handle unexpected errors
        console.error(error)
        response.json({ status: 500, data: null, message: error.message})
    }
}