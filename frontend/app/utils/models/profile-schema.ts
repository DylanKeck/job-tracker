import {z} from "zod/v4";

export const ProfileSchema = z.object({
    profileId: z.uuid('Profile ID must be a valid UUID.'),
    profileCreatedAt: z.coerce.date('Please provide a valid date.')
        .nullable(),
    profileEmail: z.string(),
    profileLocation: z.string('Please provide a valid location.')
        .nullable(),
    profileResumeUrl: z.string('Please provide a valid resume URL.')
        .max(255, 'Resume URL must be at most 255 characters.')
        .trim()
        .nullable(),
    profileUsername: z.string('Please provide a valid username.')
        .min(1, 'Username must be at least 1 character.')
        .max(100, 'Username must be at most 100 characters.')
        .trim(),
})

export type Profile = z.infer<typeof ProfileSchema>