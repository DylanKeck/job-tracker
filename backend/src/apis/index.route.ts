import { Router } from 'express'
import { indexController } from './index.controller.ts'

// define the base path for the route

const basePath = '/api'

const router = Router()

router.route('/')
    .get(indexController)

export const indexRoute = {
    router,
    basePath
}
