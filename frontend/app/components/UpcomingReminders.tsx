import type {Reminder} from "~/utils/models/reminder-schema";


export default function UpcomingReminders({reminders}: { reminders: Reminder[] }) {
    return (
        <>
            <div className="p-4 border border-gray-300 rounded-lg shadow-sm mb-4">
                <h2 className="text-2xl font-bold mb-4">Upcoming Reminders</h2>
                {reminders.length === 0 && (
                    <p className="text-gray-500">No upcoming reminders.</p>
                )}
                {reminders.map((reminder) => (
                    <div>
                <p key={reminder.reminderId} className="text-lg font-semibold mb-2">{reminder.reminderLabel}</p>
                <p className="text-sm text-gray-500" >{reminder.reminderAt.toLocaleDateString()}</p>
                    </div>
                ))}
            </div>

        </>
    )
}