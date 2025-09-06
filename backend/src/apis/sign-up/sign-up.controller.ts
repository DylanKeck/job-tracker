import {SignUpProfileSchema} from "./sign-up.model.ts";
import {zodErrorResponse} from "../../utils/response.utils.ts";
import {setActivationToken, setHash} from "../../utils/auth.utils.ts";
import type { Request, Response } from 'express'
import  Mailgun from "mailgun.js";
import formData from 'form-data'
import type {Status} from "../../utils/interfaces/Status.ts";
import {insertProfile, type Profile} from "../profile/profile.model.ts";
import {v7 as uuidv7} from "uuid"


// Controller for handling user sign-up

export async function signUpProfileController(request: Request, response: Response)  {
try {
    // Validate request body using Zod schema
    const validationResult = SignUpProfileSchema.safeParse(request.body)
    if (!validationResult.success) {
        zodErrorResponse(response, validationResult.error)
        return
    }
    // Destructure validated data
    const {profileEmail, profilePassword, profileUsername} = validationResult.data

    const profilePasswordHash = await setHash(profilePassword)
    const profileActivationToken = setActivationToken()

    // Construct activation link for the user
    const basePath: string = `${request.protocol}://localhost:5173/activate/${profileActivationToken}`
    const message = `<h2>Welcome to Job Tracker!</h2><p>Please click the link below to activate your account.</p><a href="${basePath}">${basePath}</a>`

    // Initialize Mailgun client for sending emails
    const mailgun: Mailgun = new Mailgun(formData)
    const mailgunClient = mailgun.client({username: 'api' , key: process.env.MAILGUN_API_KEY as string})
    const mailgunMessage = {
        from: `Mailgun Sandbox <postmaster@${process.env.MAILGUN_DOMAIN as string}>`,
        to: profileEmail,
        subject: 'Activate your Job Tracker account',
        html: message
    }

    // Create a new profile object
    const profile: Profile = {
        profileId: uuidv7(),
        profileActivationToken: null,
        profileCreatedAt: null,
        profileEmail,
        profileLocation: null,
        profilePasswordHash,
        profileResumeUrl: null,
        profileUsername,
    }

    // Insert the new profile into the database
    await insertProfile(profile)
    // Send activation email to the user
    await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN as string, mailgunMessage)
    const status: Status = {status: 200, message: 'Profile created successfully.', data: null}
    response.status(200).json(status)

} catch (error: any) {
    // Handle duplicate email error
    if (error.message.includes("duplicate key") || error.message.includes("already exists")) {
        const status: Status  = {
            status: 409,
            message: "A profile with this email already exists",
            data: null
        }
        return response.status(400).json(status)
    }
    // Log and respond with generic server error
    console.error(error)
    const status: Status = {
        status: 500,
        message: error.message,
        data: null
    }
    response.status(200).json(status)
}
}