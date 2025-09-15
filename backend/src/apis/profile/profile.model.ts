import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

/**
 * Zod schema for a Profile object.
 *
 * This validates data before it goes into or comes out of the database.
 * Each field has constraints that mirror the database schema.
 */
export const ProfileSchema = z.object({
    profileId: z.uuid('Profile ID must be a valid UUID.'),
    profileActivationToken: z.string('Please provide a valid activation token.')
        .length(32, 'Activation token must be 32 characters.')
        .nullable(),
    profileCreatedAt: z.coerce.date('Please provide a valid date.')
        .nullable(),
    profileEmail: z.email('Please provide a valid email address.')
        .max(128, 'Email must be at most 128 characters.'),
    profileLocation: z.string('Please provide a valid location.')
        .nullable(),
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

/**
 * PublicProfileSchema omits sensitive fields from ProfileSchema.
 * Used for returning safe public profile data.
 */
export const PublicProfileSchema = ProfileSchema.omit({profileActivationToken: true, profilePasswordHash: true})

// Inferred TypeScript type from the Zod schema (use this everywhere instead of `any`)
export type Profile = z.infer<typeof ProfileSchema>;
export type PublicProfile = z.infer<typeof PublicProfileSchema>;

/**
 * Insert a new profile row into the database.
 *
 * @param profile - A Profile object that has been validated by Zod
 * @returns Success message string
 *
 * @throws ZodError if validation fails
 * @throws DatabaseError if the insert fails (e.g. unique violation)
 */
export async function insertProfile(profile: Profile): Promise<string> {
    // Validate the profile object using Zod schema
    ProfileSchema.parse(profile);
    // Destructure profile fields for SQL insert
    const {profileId, profileActivationToken, profileCreatedAt, profileEmail, profileLocation, profilePasswordHash, profileResumeUrl, profileUsername} = profile
    // Insert the profile into the database
    await sql`INSERT INTO profile (profile_id, profile_activation_token, profile_created_at, profile_email, profile_location, profile_password_hash, profile_resume_url, profile_username) VALUES (${profileId}, ${profileActivationToken}, ${profileCreatedAt}, ${profileEmail}, ${profileLocation}, ${profilePasswordHash}, ${profileResumeUrl}, ${profileUsername})`
    return 'Profile created successfully'
}

/**
 * Select a profile by its activation token.
 *
 * @param profileActivationToken - The activation token to search for
 * @returns The Profile object if found, otherwise null
 */
export async function selectProfileByActivationToken(profileActivationToken: string | null): Promise<Profile | null> {
    // Query the database for a profile with the given activation token
    const rowList = await sql`SELECT profile_id, profile_activation_token, profile_created_at, profile_email, profile_location, profile_password_hash, profile_resume_url, profile_username FROM profile WHERE profile_activation_token = ${profileActivationToken}`
    // Parse and return the first result, or null if not found
    const result = ProfileSchema.array().max(1).parse(rowList)
    return result[0] ?? null
}

/**
 * Update an existing profile in the database.
 *
 * @param profile - The Profile object with updated fields
 * @returns Success message string
 */
export async function updateProfile(profile: Profile): Promise<string> {
    // Destructure profile fields for SQL update
    const {profileId, profileActivationToken, profileCreatedAt, profileEmail, profileLocation, profilePasswordHash, profileResumeUrl, profileUsername} = profile
    // Update the profile in the database
    await sql`UPDATE profile SET profile_activation_token = ${profileActivationToken}, profile_created_at = ${profileCreatedAt}, profile_email = ${profileEmail}, profile_location = ${profileLocation}, profile_password_hash = ${profilePasswordHash}, profile_resume_url = ${profileResumeUrl}, profile_username = ${profileUsername} WHERE profile_id = ${profileId}`
    return 'Profile updated successfully'
}

/**
 * Update a public profile (fields that are safe to expose publicly).
 *
 * @param profile - The PublicProfile object with updated fields
 * @returns Success message string
 */
export async function updatePublicProfile(profile: PublicProfile): Promise<string> {
    // Destructure public profile fields for SQL update
    const {profileId, profileCreatedAt, profileEmail, profileLocation, profileResumeUrl, profileUsername} = profile
    // Update the public profile fields in the database
    await sql`UPDATE profile SET profile_created_at = ${profileCreatedAt}, profile_email = ${profileEmail}, profile_location = ${profileLocation}, profile_resume_url = ${profileResumeUrl}, profile_username = ${profileUsername} WHERE profile_id = ${profileId}`
    return 'Profile updated successfully'
}

/**
 * Select a profile by its email address.
 *
 * @param profileEmail - The email address to search for
 * @returns The Profile object if found, otherwise null
 */
export async function selectProfileByProfileEmail(profileEmail: string): Promise<Profile | null> {
    // Query the database for a profile with the given email
    const rowList = await sql`SELECT profile_id, profile_activation_token, profile_created_at, profile_email, profile_location, profile_password_hash, profile_resume_url, profile_username FROM profile WHERE profile_email = ${profileEmail}`
    // Parse and return the first result, or null if not found
    const result = ProfileSchema.array().max(1).parse(rowList)
    return result[0] ?? null
}

/**
 * Select a public profile by its profile ID.
 *
 * @param profileId - The profile ID to search for
 * @returns The PublicProfile object if found, otherwise null
 */
export async function selectProfileByProfileId(profileId: string): Promise<PublicProfile | null> {
    // Query the database for a profile with the given ID, omitting sensitive fields
    const rowList = await sql`SELECT profile_id, profile_created_at, profile_email, profile_location, profile_resume_url, profile_username FROM profile WHERE profile_id = ${profileId}`
    // Parse and return the first result, or null if not found
    const result = PublicProfileSchema.array().max(1).parse(rowList)
    return result[0] ?? null
}
