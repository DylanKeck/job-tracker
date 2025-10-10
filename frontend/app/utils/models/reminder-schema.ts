import {z} from "zod/v4";

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