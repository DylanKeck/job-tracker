import type {Request, Response} from "express";
import type {Status} from "../../utils/interfaces/Status.ts";

import {generateJwt} from "../../utils/auth.utils.ts";
import pkg from "jsonwebtoken";
import {
    type PublicProfile,
    PublicProfileSchema,
    selectProfileByProfileId,
    updatePublicProfile
} from "./profile.model.ts";
import {serverErrorResponse, zodErrorResponse} from "../../utils/response.utils.ts";
const {verify} = pkg

/**
 * Updates a public profile by profileId.
 *
 * Validates the request parameters and body, checks session authorization,
 * updates the profile in the database, and refreshes the session JWT.
 *
 * @param request - Express request object containing params and body
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function putProfileController (request: Request, response: Response): Promise<void> {
    try {
        // Validate profileId in request params
        const paramsValidationResult = PublicProfileSchema.pick({profileId: true}).safeParse(request.params)
        // Validate request body for public profile fields
        const bodyValidationResult = PublicProfileSchema.safeParse(request.body)

        // If params validation fails, send error response
        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        // If body validation fails, send error response
        if(!bodyValidationResult.success) {
            zodErrorResponse(response, bodyValidationResult.error)
            return
        }
        const {profileId} = paramsValidationResult.data
        const {profileUsername, profileLocation, profileResumeUrl} = bodyValidationResult.data
        // Get profile from session for authorization check
        const profileFromSession = request.session.profile
        const profileIdFromSession = profileFromSession?.profileId
        // Only allow update if session profileId matches param profileId
        if(profileId !== profileIdFromSession) {
           response.json({status: 400, data: null, message: "You are not allowed to preform this task"})
           return
        }
        // Fetch the profile from the database
        const profile: PublicProfile | null = await selectProfileByProfileId(profileId)
        if(profile === null) {
            response.json({status: 400, data: null,message:"Profile does not exist" })
            return
        }
        // Update profile fields
        profile.profileUsername = profileUsername
        profile.profileLocation = profileLocation
        profile.profileResumeUrl = profileResumeUrl
        await updatePublicProfile(profile)

        // Refresh JWT and session with updated profile info
        const jwt = request.session.jwt ?? ""
        const signature = request.session.signature ?? ""
        const parsedJwt = verify(jwt, signature) as any;
        if (typeof parsedJwt === "string") {
            response.json({status: 400, data: null,message:"Invalid JWT Token" })
            return
        }
        // Update JWT payload with new profile info
        parsedJwt.auth = {
            profileId: profile.profileId,
            profileUsername: profile.profileUsername,
            profileLocation: profile.profileLocation,
            profileEmail: profile.profileEmail,
            profileCreatedAt: profile.profileCreatedAt,
            profileResumeUrl: profile.profileResumeUrl
        }
        // Generate new JWT
        const newJwt = await generateJwt(parsedJwt.auth, signature)
        // Update session with new profile and JWT
        request.session.profile = {
            profileId: profile.profileId,
            profileUsername: profile.profileUsername,
            profileLocation: profile.profileLocation,
            profileEmail: profile.profileEmail,
            profileCreatedAt: profile.profileCreatedAt,
            profileResumeUrl: profile.profileResumeUrl
        }
        request.session.jwt = newJwt
        // Set new JWT in response header
        response.header({
            Authorization: newJwt
        })
        // Send success response
        response.json({status: 200, data: null, message: 'Profile updated successfully'})
    } catch (error) {
        // Handle unexpected errors
        serverErrorResponse(response, null)
    }
}

/**
 * Retrieves a public profile by profileId.
 *
 * Validates the request params and fetches the profile from the database.
 *
 * @param request - Express request object containing params
 * @param response - Express response object for sending responses
 * @returns Promise<void>
 */
export async function getProfileByProfileIdController (request: Request, response: Response): Promise<void> {
    try {
        // Validate profileId in request params
        const validationResult = PublicProfileSchema.pick({profileId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {profileId} = validationResult.data
        // Fetch public profile from the database
        const data = await selectProfileByProfileId(profileId)
        const status: Status = {status: 200, data, message: null};
        // Send profile data in response
        response.json(status)
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        serverErrorResponse(response, null)
    }
}
