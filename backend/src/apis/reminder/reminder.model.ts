import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

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

export type Reminder = z.infer<typeof ReminderSchema>;

export async function insertReminder(reminder: Reminder): Promise<string> {
    const {reminderId, reminderJobId, reminderAt, reminderCreatedAt, reminderDone, reminderLabel} = reminder
    const rowList = await sql`INSERT INTO reminder(reminder_id, reminder_job_id, reminder_at, reminder_created_at, reminder_done, reminder_label) VALUES (${reminderId}, ${reminderJobId}, ${reminderAt}, now(), ${reminderDone}, ${reminderLabel})`
    return 'Added a new reminder';
}

export async function updateReminder(reminder: Reminder): Promise<string> {
    const {reminderId, reminderAt, reminderDone, reminderLabel} = reminder
    await sql`UPDATE reminder SET reminder_at = ${reminderAt}, reminder_done = ${reminderDone}, reminder_label = ${reminderLabel} WHERE reminder_id = ${reminderId}`
    return 'Updated reminder';
}

export async function deleteReminder(reminderId: string): Promise<string> {
    await sql`DELETE FROM reminder WHERE reminder_id = ${reminderId}`
    return 'Deleted reminder';
}

export async function selectRemindersByJobId(reminderJobId: string): Promise<Reminder[] | null> {
    const rowList = await sql`SELECT reminder_id, reminder_job_id, reminder_at, reminder_created_at, reminder_done, reminder_label FROM reminder WHERE reminder_job_id = ${reminderJobId}`
    return ReminderSchema.array().parse(rowList)
}