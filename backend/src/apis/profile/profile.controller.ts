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

export async function putProfileController (request: Request, response: Response): Promise<void> {
    try {
        const paramsValidationResult = PublicProfileSchema.pick({profileId: true}).safeParse(request.params)
        const bodyValidationResult = PublicProfileSchema.safeParse(request.body)

        if(!paramsValidationResult.success) {
            zodErrorResponse(response, paramsValidationResult.error)
            return
        }
        if(!bodyValidationResult.success) {
            zodErrorResponse(response, bodyValidationResult.error)
            return
        }
        const {profileId} = paramsValidationResult.data
        const {profileUsername, profileLocation, profileResumeUrl} = bodyValidationResult.data
        const profileFromSession = request.session.profile
        const profileIdFromSession = profileFromSession?.profileId
        if(profileId !== profileIdFromSession) {
           response.json({status: 400, data: null, message: "You are not allowed to preform this task"})
        }
        const profile: PublicProfile | null = await selectProfileByProfileId(profileId)
        if(profile === null) {
            response.json({status: 400, data: null,message:"Profile does not exist" })
            return
        }
        profile.profileUsername = profileUsername
        profile.profileLocation = profileLocation
        profile.profileResumeUrl = profileResumeUrl
        await updatePublicProfile(profile)

        const jwt = request.session.jwt ?? ""
        const signature = request.session.signature ?? ""
        const parsedJwt = verify(jwt, signature) as any;
        if (typeof parsedJwt === "string") {
            response.json({status: 400, data: null,message:"Invalid JWT Token" })
        }
        parsedJwt.auth = {
            profileId: profile.profileId,
            profileUsername: profile.profileUsername,
            profileLocation: profile.profileLocation,
            profileEmail: profile.profileEmail,
            profileCreatedAt: profile.profileCreatedAt,
            profileResumeUrl: profile.profileResumeUrl
        }
        const newJwt = await generateJwt(parsedJwt.auth, signature)
        request.session.profile = {
            profileId: profile.profileId,
            profileUsername: profile.profileUsername,
            profileLocation: profile.profileLocation,
            profileEmail: profile.profileEmail,
            profileCreatedAt: profile.profileCreatedAt,
            profileResumeUrl: profile.profileResumeUrl
        }
        request.session.jwt = newJwt
        response.header({
            Authorization: newJwt
        })
        response.json({status: 200, data: null, message: 'Profile updated successfully'})
    } catch (error) {
        serverErrorResponse(response, null)
    }
}

export async function getProfileByProfileIdController (request: Request, response: Response): Promise<void> {
    try {
        const validationResult = PublicProfileSchema.pick({profileId: true}).safeParse(request.params)
        if(!validationResult.success) {
            zodErrorResponse(response, validationResult.error)
            return
        }
        const {profileId} = validationResult.data
        const data = await selectProfileByProfileId(profileId)
        const status: Status = {status: 200, data, message: null};
        response.json(status)
    } catch (error) {
        console.error(error)
        serverErrorResponse(response, null)
    }
}

