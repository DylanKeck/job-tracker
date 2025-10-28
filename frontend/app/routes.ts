import {type RouteConfig, index, route, layout} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("signup", "routes/signup.tsx"),
    route("login", "routes/login.tsx"),
    route("activate/:profileActivationToken?", "routes/activation.tsx"),
    route("api/job-delete", "routes/job-delete-route.tsx"),
    layout("layouts/navbar.tsx", [
        route("dashboard", "routes/dashboard.tsx"),
        route("jobs", "routes/jobs.tsx"),
        route("add-job", "routes/add-job.tsx"),
        route("jobs/job-details", "routes/job-detail.tsx"),
        route("api/update-job-note", "routes/update-job-note.tsx"),
        route("logout", "routes/logout.tsx"),
        route("profile", "routes/profile.tsx"),
        route("reminders", "routes/reminder.tsx"),
    ]),
] satisfies RouteConfig;
