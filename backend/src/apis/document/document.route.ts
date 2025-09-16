import {Router} from "express";
import {
    deleteDocumentController,
    getDocumentController,
    postDocumentController,
    putDocumentController
} from "./document.controller.ts";
import {isLoggedInController} from "../../utils/controllers/is-logged-in.controller.ts";


const basePath = '/api/document'
const router = Router()

router.route('/')
    .post(isLoggedInController, postDocumentController)

router.route('/:documentId')
    .put(isLoggedInController, putDocumentController)
    .delete(isLoggedInController, deleteDocumentController)

router.route('/:jobId')
    .get(getDocumentController)
export const documentRoute = {basePath, router}