import {useEffect, useState} from "react";
import {Form, redirect, useActionData, useNavigate, useSearchParams} from "react-router";
import {MdOutlineEmail} from "react-icons/md";
import {RiLockPasswordLine} from "react-icons/ri";
import {IconContext} from "react-icons";
import {BiHide, BiShow} from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import type {Route} from "../+types/root";
import {commitSession, getSession} from "~/utils/session.server";
import {postSignIn, type SignIn, SignInSchema} from "~/utils/models/sign-in.model";
import {jwtDecode} from "jwt-decode";
import {ProfileSchema} from "~/utils/models/profile-schema";
import {zodResolver} from "@hookform/resolvers/zod";
import {getValidatedFormData, useRemixForm} from "remix-hook-form";


/**
 * Returns meta information for the Login route, such as title and description.
 * Used by the framework to set document head tags.
 *
 * @param {Route.MetaArgs} args - Arguments for meta generation (unused).
 * @returns {Array<object>} Array of meta tag objects.
 */
export function meta({}: Route.MetaArgs) {
    return [
        { title: "Job Tracker" },
        { name: "description", content: "please sign in or sign up" },
    ];
}


const formSchema = SignInSchema
const resolver = zodResolver(formSchema)

/**
 * Action function for the Login route.
 * Handles user sign-in, session creation, JWT validation, and redirects on success.
 * Returns errors for invalid credentials or malformed profile.
 *
 * @param {Route.ActionArgs} args - Contains the request object for form data and headers.
 * @returns {Promise<object|Response>} Success message, error, or redirect.
 */
export async function action({request}: Route.ActionArgs) {
    try {
        // Validate form data using Zod schema
        const { errors, data, receivedValues: defaultValues } =
            await getValidatedFormData<SignIn>(request, resolver);
        if (errors) {
            // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
            return { errors, defaultValues };
        }

        // Retrieve session from cookies
        const session = await getSession(
            request.headers.get("Cookie")
        )

        // Parse and validate sign-in data
        const validatedData = SignInSchema.parse(data);

        // Send sign-in request to backend
        const {result, headers} = await postSignIn(validatedData);

        // Extract authorization token and session cookie from response
        const authorization = headers.get('authorization');
        const expressSessionCookie = headers.get('Set-Cookie');
        if(result.status !== 200 || !authorization) {
            // Invalid credentials or missing token
            return {success: false, error: result.message, status: 400};
        }

        // Decode JWT and validate profile
        const parsedJwtToken = jwtDecode(authorization) as any
        const validationResult = ProfileSchema.safeParse(parsedJwtToken.auth);

        if(!validationResult.success) {
            // Malformed profile in JWT
            session.flash('error', 'profile is malformed')
            return {success: false, error: 'internal server error try again later', status: 400}
        }
        // Store authorization and profile in session
        session.set('authorization', authorization);
        session.set('profile', validationResult.data)
        const responseHeaders = new Headers()
        responseHeaders.append('Set-Cookie', await commitSession(session))

        if(expressSessionCookie) {
            // Set express session cookie if present
            responseHeaders.append('Set-Cookie', expressSessionCookie);
        }

        // Redirect to home page on successful login
        return redirect('/dashboard', {headers: responseHeaders});
    } catch (error) {
        // Handle unexpected errors
        console.error('Sign-in action error:', error);
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 500};
    }
}

/**
 * Login component renders the login form and handles UI state for sign-in.
 * Displays toast messages, error feedback, and toggles password visibility.
 *
 * @returns {JSX.Element} The rendered login page UI.
 */
export default function Login() {
    // Get action data for error feedback
    const actionData = useActionData<{success: boolean; validationErrors?: any; error?: string}>()


    // Setup form handling with validation
    const {
        register,
        formState: {errors, isSubmitting},
        reset,
        handleSubmit,
        watch,
    } = useRemixForm<SignIn>({
        resolver,
        mode: "onChange"
    })
    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);
    // Navigation and search params for toast messages
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMessage = searchParams.get("message");

    // Watch form fields for completeness
    const profileEmail = watch("profileEmail") ?? "";
    const profilePassword = watch("profilePassword") ?? "";
    const isFormComplete = profileEmail.length > 0 && profilePassword.length > 0;
    const buttonDisabled =
        isSubmitting ||
        Object.keys(errors).length > 0 ||
        profilePassword.length < 8 ||
        !isFormComplete;

    // Toast message state
    const [showToast, setShowToast] = useState(!!initialMessage);
    const [message, setMessage] = useState(initialMessage);

    // Hide toast after 5 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md space-y-6">
                    {/* Toast */}
                    {showToast && message && (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-700 bg-emerald-900/40 px-4 py-3 text-emerald-200 shadow">
                            <span className="text-sm">{message}</span>
                            <button
                                className="ml-4 hover:text-emerald-100"
                                onClick={() => setShowToast(false)}
                                aria-label="Close"
                            >
                                <AiOutlineClose className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Heading */}
                    <div className="text-center">
                        <h1 className="text-2xl sm:text-3xl font-semibold">Welcome to Job Tracker</h1>
                        <p className="text-slate-400 text-sm mt-1">Sign in to continue</p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
                        {/* Auth toggle */}
                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-4 py-2 rounded-lg bg-violet-600 text-white shadow hover:bg-violet-500 transition"
                                type="button"
                            >
                                Login
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
                                type="button"
                                onClick={() => navigate("/signup")}
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Form */}
                        <Form
                            method="post"
                            onSubmit={handleSubmit}
                            id="login-form"
                            className="space-y-4"
                        >
                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-sm text-slate-300">Email</label>
                                <div className="relative">
                                    <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        {...register("profileEmail")}
                                        placeholder="you@example.com"
                                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                        required
                                    />
                                </div>
                                {errors?.profileEmail && (
                                    <p className="text-rose-400 text-xs">{String(errors.profileEmail.message)}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1">
                                <label className="block text-sm text-slate-300">Password</label>
                                <div className="relative">
                                    <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        {...register("profilePassword")}
                                        placeholder="••••••••"
                                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                                        required
                                    />
                                    <IconContext.Provider value={{ size: "1.25em" }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                        >
                                            {showPassword ? <BiHide /> : <BiShow />}
                                        </button>
                                    </IconContext.Provider>
                                </div>
                                {errors?.profilePassword && (
                                    <p className="text-rose-400 text-xs">{String(errors.profilePassword.message)}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={buttonDisabled}
                                className={`w-full rounded-lg py-2 font-medium text-white transition
                ${buttonDisabled
                                    ? "bg-slate-700 cursor-not-allowed"
                                    : "bg-violet-600 hover:bg-violet-500"
                                }`}
                            >
                                {isSubmitting ? "Signing in…" : "Login"}
                            </button>

                            {/* Server error */}
                            {actionData?.error && (
                                <div className="rounded-md border border-rose-900 bg-rose-950/40 text-rose-200 text-sm px-3 py-2">
                                    {actionData.error}
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
    )
}