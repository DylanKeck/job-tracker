import { App } from './App.ts'
import {createClient} from "redis";
import type {RedisClientType} from "redis";
import type {PublicProfile} from "./apis/profile/profile.model.ts";


declare module 'express-session' {
    export interface SessionData {
        profile: PublicProfile | undefined
        signature: string | undefined
        jwt: string | undefined
    }
}


// instantiate new app and pass it a port as an argument to start with (4200)
let redisClient : RedisClientType | undefined

async function main (): Promise<void> {
    if (redisClient === undefined) {
        redisClient = createClient({ socket: { host: process.env.REDIS_HOST } })
        redisClient.connect().catch(console.error)
    }
    try {
        const app = new App(redisClient)
        app.listen()
    } catch (e) {
        console.log(e)
    }
}

main().catch(error => { console.error(error) })