import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

export const ProfileSchema = z.object({
    profileId: z.uuid('Profile ID must be a valid UUID.'),
    profileActivationToken: z.string('Please provide a valid activation token.')
        .length(32, 'Activation token must be 32 characters.')
        .nullable(),
    profileCreatedAt: z.coerce.date('Please provide a valid date.')
        .nullable(),
    profileEmail: z.email('Please provide a valid email address.')
        .max(128, 'Email must be at most 128 characters.'),
    profileLocation: z.string('Please provide a valid location.'),
    profilePasswordHash: z.string('Please provide a valid password hash.')
        .length(97, 'Password hash must 97 characters.'),
    profileResumeUrl: z.string('Please provide a valid resume URL.')
        .max(255, 'Resume URL must be at most 255 characters.')
        .trim()
        .nullable(),
    profileUsername: z.string('Please provide a valid username.')
        .min(1, 'Username must be at least 1 character.')
        .max(100, 'Username must be at most 100 characters.')
        .trim(),
})
export type Profile = z.infer<typeof ProfileSchema>;

export async function insertProfile(profile: Profile): Promise<string> {
    ProfileSchema.parse(profile);
    const {profileId, profileActivationToken, profileCreatedAt, profileEmail, profileLocation, profilePasswordHash, profileResumeUrl, profileUsername} = profile
    await sql`INSERT INTO profile (profileId, profileActivationToken, profileCreatedAt, profileEmail, profileLocation, profilePasswordHash, profileResumeUrl, profileUsername) VALUES (${profileId}, ${profileActivationToken}, ${profileCreatedAt}, ${profileEmail}, ${profileLocation}, ${profilePasswordHash}, ${profileResumeUrl}, ${profileUsername})`
    return 'Profile created successfully'
}