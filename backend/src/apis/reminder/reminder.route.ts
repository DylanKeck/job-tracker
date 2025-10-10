import {Router} from "express";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";
import {
    deleteReminderController, getAllRemindersController,
    getRemindersByJobIdController,
    postReminderController, putReminderController
} from "./reminder.controller.ts";

const basePath = '/api/reminder';
const router = Router();

router.route('/')
    .post(isLoggedInController, postReminderController)
router.route('/:profileId')
    .get(isLoggedInController, getAllRemindersController)

router.route('/:reminderId')
    .delete(isLoggedInController, deleteReminderController)
    .put(isLoggedInController, putReminderController)
router.route('/:reminderJobId')
    .get(getRemindersByJobIdController)

export const reminderRoute = {basePath, router};