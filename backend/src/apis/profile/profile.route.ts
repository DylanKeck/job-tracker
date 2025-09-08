import {Router} from "express";
import {getProfileByProfileIdController, putProfileController} from "./profile.controller.ts";

const basePath = '/api/profile'
const router: Router = Router()

router.route('/profileId')
    .get(getProfileByProfileIdController)
    .put(putProfileController)

export const profileRoute = {basePath, router}