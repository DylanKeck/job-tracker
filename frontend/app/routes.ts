import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("signup","routes/signup.tsx"),
    route("login","routes/login.tsx"),
    route("dashboard","routes/dashboard.tsx"),
    route("jobs","routes/jobs.tsx"),
    route("add-job","routes/add-job.tsx"),
    route("jobs/job-details","routes/job-detail.tsx"),
    route("api/update-job-note", "routes/update-job-note.tsx"),
] satisfies RouteConfig;
