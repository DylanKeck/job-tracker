import {ProfileSchema} from "../profile/profile.model.ts";
import {z} from "zod/v4";


export const SignUpProfileSchema = ProfileSchema.omit({profileId: true, profileActivationToken: true, profileCreatedAt: true, profilePasswordHash: true, profileLocation: true, profileResumeUrl: true })
.extend({
    profilePassword: z.string('Profile password must be at least 8 characters.')
        .min(8, 'Password must be at least 8 characters.')
        .max(32, 'Password must be at most 32 characters.'),
    profilePasswordConfirm: z.string('Profile password confirmation must match password.')
        .min(8, 'Password must be at least 8 characters.')
        .max(32, 'Password must be at most 32 characters.')
})
.refine((data) => data.profilePassword === data.profilePasswordConfirm, {
    message: 'Passwords do not match.'
});