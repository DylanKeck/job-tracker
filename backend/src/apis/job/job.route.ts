import {Router} from "express";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";
import {
    deleteJobController,
    getAllJobsController,
    getJobNotesController, getJobsByRecentlyAddedController,
    postJobController,
    postJobNoteController,
    putJobController, putJobNoteController
} from "./job.controller.ts";

const basePath = '/api/job'
const router = Router()

router.route('/')
    .post(isLoggedInController, postJobController)
router.route('/updateJob/:jobId')
    .put(isLoggedInController, putJobController)


router.route('/updateJobNote/:jobNoteId')
    .put(isLoggedInController, putJobNoteController)

router.route('/:profileId')
    .get(getAllJobsController)

router.route('/recentJobs/:profileId')
    .get(getJobsByRecentlyAddedController)
router.route('/jobNotes/:jobId')
    .get(getJobNotesController)
    .post(isLoggedInController, postJobNoteController)

router.route('/deleteJob/:jobId')
    .delete(isLoggedInController, deleteJobController)

export const jobRoute = {basePath, router}