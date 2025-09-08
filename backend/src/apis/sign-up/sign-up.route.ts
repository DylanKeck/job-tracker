import {Router} from "express";
import {signUpProfileController} from "./sign-up.controller.ts";
import {activationController} from "./activation.controller.ts";

const basePath = '/api/sign-up' as const

const router = Router()

router.route('/')
    .post(signUpProfileController)
router.route('/activation/:profileActivationToken')
    .get(activationController)

export const signUpRoute = {basePath, router}