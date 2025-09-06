import type {Request, Response} from "express";
import {ProfileSchema} from "../profile/profile.model.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";
import {selectProfileByActivationToken, updateProfile} from "../profile/profile.model.ts";

// Handles account activation requests
export async function activationController(request: Request, response: Response): Promise<void> {
    try {
        // Validate the activation token from request parameters using Zod schema
        const validationResult = ProfileSchema.pick({ profileActivationToken: true }).safeParse(request.params);
        if (!validationResult.success) {
            // Respond with validation errors if token is invalid
            zodErrorResponse(response, validationResult.error);
            return;
        }

        // Extract the activation token
        const { profileActivationToken } = validationResult.data;
        // Attempt to find a profile with the given activation token
        const profile = await selectProfileByActivationToken(profileActivationToken)

        if(profile === null) {
            // If no profile found, respond with failure (possibly already activated)
            response.json({
                status: 400,
                data: null,
                message: "Account activation failed. Have you already activated your account?"
            })
            return;
        }
        // Nullify the activation token to mark the account as activated
        profile.profileActivationToken = null
        // Update the profile in the database
        await updateProfile(profile)
        // Respond with success
        response.json({
            status: 200,
            data: null,
            message: "Account successfully activated."
        })
    } catch (error) {
        // Handle unexpected errors
        console.error(error)
        response.json({
            status: 500,
            data: null,
            message: "Internal server error. Please try again later."
        })
    }
}