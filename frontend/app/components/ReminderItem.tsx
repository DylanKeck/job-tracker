import { useFetcher } from "react-router";
import type {Reminder} from "~/utils/models/reminder-schema";
import type {Job} from "~/utils/types/job";

export default function ReminderItem({ reminder, jobs }: { reminder: Reminder; jobs: Job[] }) {
    const fetcher = useFetcher();

    // ✅ initial state from loader, instant optimistic flip while submitting
    const optimisticDone =
        fetcher.formData
            ? fetcher.formData.get("reminderDone") === "true"
            : reminder.reminderDone; // must be a boolean here

    const job = jobs.find(j => j.jobId === reminder.reminderJobId);

    return (
        <ul>
            <li>{reminder.reminderLabel}</li>
            <li>{reminder.reminderAt.toLocaleDateString()}</li>
            <li>{reminder.reminderDone}</li>
            {job && <li>For {job.jobRole} at {job.jobCompany}</li>}
            <label>
                <input
                    type="checkbox"

                    checked={optimisticDone}
                    onChange={(e) =>
                        fetcher.submit(
                            {
                                _action: "toggleDone",
                                reminderId: reminder.reminderId,
                                reminderDone: String(e.currentTarget.checked),
                            },
                            { method: "put" }
                        )
                    }
                    disabled={fetcher.state === "submitting"}
                />
                Done
            </label>
        </ul>
    );
}
