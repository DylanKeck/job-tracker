import type {Route} from "../../.react-router/types/app/+types/root";
import {destroySession, getSession} from "~/utils/session.server";
import {redirect} from "react-router";

export async function action(request: Route.ActionArgs) {
    const session = await getSession(
        request.request.headers.get("Cookie"))
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}