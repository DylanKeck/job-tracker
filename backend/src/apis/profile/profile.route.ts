import {Router} from "express";
import {getProfileByProfileIdController, putProfileController} from "./profile.controller.ts";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";

const basePath = '/api/profile'
const router: Router = Router()

router.route('/:profileId')
    .get(getProfileByProfileIdController)
    .put(isLoggedInController, putProfileController)

export const profileRoute = {basePath, router}