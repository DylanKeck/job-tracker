import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

/**
 * Zod schema for a Reminder object.
 *
 * Validates reminder data before database operations. Each field mirrors the reminder table schema.
 */
export const ReminderSchema = z.object({
    reminderId: z.uuidv7('please provide a valid uuid7 for reminderId'),
    reminderJobId: z.uuidv7('please provide a valid uuid7 for reminderJobId'),
    reminderAt: z.coerce.date('please provide a valid date for reminderAt'),
    reminderCreatedAt: z.coerce.date('please provide a valid date for reminderCreated'),
    reminderDone: z.boolean('please provide a valid boolean'),
    reminderLabel: z.string('reminderLabel must be a string')
        .min(1, 'reminderLabel must be at least 1 character')
        .max(100, 'reminderLabel must be at most 100 characters')
        .trim(),
})

// TypeScript type inferred from ReminderSchema
export type Reminder = z.infer<typeof ReminderSchema>;

/**
 * Inserts a new reminder into the database.
 *
 * @param reminder - Reminder object validated by ReminderSchema
 * @returns Success message string
 */
export async function insertReminder(reminder: Reminder): Promise<string> {
    // Destructure reminder fields for SQL insert
    const {reminderId, reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel} = reminder
    const rowList = await sql`INSERT INTO reminder(reminder_id, reminder_job_id, reminder_at, reminder_created_at, reminder_done, reminder_label) VALUES (${reminderId}, ${reminderJobId}, ${reminderAt}, now(), ${reminderDone}, ${reminderLabel})`
    return 'Added a new reminder';
}

/**
 * Updates an existing reminder in the database.
 *
 * @param reminder - Reminder object with updated fields
 * @returns Success message string
 */
export async function updateReminder(reminder: Reminder): Promise<string> {
    // Destructure reminder fields for SQL update
    const {reminderId, reminderAt, reminderDone, reminderLabel} = reminder
    // Update reminder in the database
    await sql`UPDATE reminder SET reminder_at = ${reminderAt}, reminder_done = ${reminderDone}, reminder_label = ${reminderLabel} WHERE reminder_id = ${reminderId}`
    return 'Updated reminder';
}

/**
 * Deletes a reminder by its reminderId.
 *
 * @param reminderId - The reminder ID to delete
 * @returns Success message string
 */
export async function deleteReminder(reminderId: string): Promise<string> {
    // Delete reminder from the database
    await sql`DELETE FROM reminder WHERE reminder_id = ${reminderId}`
    return 'Deleted reminder';
}

/**
 * Selects all reminders for a given jobId.
 *
 * @param reminderJobId - The job ID to filter reminders by
 * @returns Array of Reminder objects or null if none found
 */
export async function selectRemindersByJobId(reminderJobId: string): Promise<Reminder[] | null> {
    // Query reminders by jobId
    const rowList = await sql`SELECT reminder_id, reminder_job_id, reminder_at, reminder_created_at, reminder_done, reminder_label FROM reminder WHERE reminder_job_id = ${reminderJobId}`
    // Parse result using ReminderSchema array
    return ReminderSchema.array().parse(rowList)
}