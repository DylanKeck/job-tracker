import RecentApplications from "~/components/RecentApplications";
import type {Route} from "../../.react-router/types/app/routes/+types/dashboard";
import {getJobLoaderData} from "~/utils/loaders/job-loader";



// const jobs = [
//     { jobId: "1", jobRole: "Software Engineer", jobCompany: "Tech Corp", jobAppliedOn: "2023-10-01", jobStatus: "Interview Scheduled", jobPostingUrl: "https://techcorp.com/jobs/1",jobLocation: "New York, NY", jobSalaryMin: 80000, jobSalaryMax: 120000, jobSource: "LinkedIn" },
//     { jobId: "2", jobRole: "Product Manager", jobCompany: "Business Inc", jobAppliedOn: "2023-09-28",jobStatus: "Interview Scheduled", jobPostingUrl: "https://techcorp.com/jobs/1",jobLocation: "New York, NY", jobSalaryMin: 80000, jobSalaryMax: 120000, jobSource: "LinkedIn" },
//     { jobId: "3", jobRole: "Data Analyst", jobCompany: "Data Solutions", jobAppliedOn: "2023-09-25",jobStatus: "Interview Scheduled", jobPostingUrl: "https://techcorp.com/jobs/1",jobLocation: "New York, NY", jobSalaryMin: 80000, jobSalaryMax: 120000, jobSource: "LinkedIn" },
// ];

export async function loader({request}: Route.LoaderArgs) {
    return await getJobLoaderData(request)

}
export default function Dashboard({loaderData}: Route.ComponentProps) {
    const {jobs} = loaderData
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <p className="text-lg">Welcome to your dashboard!</p>
            </div>
            <RecentApplications jobs={jobs}/></>
    );
}