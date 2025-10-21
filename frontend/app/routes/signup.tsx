import {ImProfile} from "react-icons/im";
import {MdOutlineEmail} from "react-icons/md";
import {RiLockPasswordLine} from "react-icons/ri";
import {IconContext} from "react-icons";
import {BiHide, BiShow} from "react-icons/bi";
import {GiConfirmed} from "react-icons/gi";
import {Form, redirect, useActionData, useNavigate} from "react-router";
import {useState} from "react";
import type {Route} from "../+types/root";
import * as process from "node:process";

/**
 * Handles user sign-up form submission.
 * Validates input fields, sends POST request to backend, and redirects or returns error messages.
 *
 * @param {Route.ActionArgs} args - Contains the request object for form data and headers.
 * @returns {Promise<object|Response>} Redirects to login on success, or returns error object on failure.
 */
export async function action({request}: Route.ActionArgs) {
    try {
        const formData = await request.formData();
        const profile = Object.fromEntries(formData);
        // Basic validation: all fields required
        if (!profile.profileUsername || !profile.profileEmail || !profile.profilePassword || !profile.profilePasswordConfirm) {
            return {success: false, error: "All fields are required."};
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.profileEmail as string)) {
            return {success: false, error: "Please enter a valid email address."};
        }
        // Password match validation
        if (profile.profilePassword !== profile.profilePasswordConfirm) {
            return {success: false, error: "Passwords do not match."};
        }
        // Password length validation
        if (typeof profile.profilePassword === "string") {
            if (profile.profilePassword.length < 8) {
                return {success: false, error: "Password must be at least 8 characters long."};
            }
        }
        // Send sign-up request to backend
        const response = await fetch(`${process.env.REST_API_URL}/sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profile)
        });
        const data = await response.json();
        if (data.status === 200) {
            // Success: redirect to login with message
            return redirect("/login?message=Please check your email to verify your account");
        }
        if (data.status === 409) {
            // Email already exists
            return { success: false, error: "An account with this email already exists." };
        }
        // Show backend error if present
        if (data.error) {
            return { success: false, error: data.error };
        }
        // Unknown error fallback
        return { success: false, error: "Unknown error" };
    } catch (error: any) {
        // Handle unexpected errors
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 500 };
    }
}

/**
 * Signup component renders the sign-up form and handles UI state for registration.
 * Displays error messages, toggles password visibility, and manages form data.
 *
 * @returns {JSX.Element} The rendered sign-up page UI.
 */
export default function Signup() {
    // State for password visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // State for error message display
    const [errorMessage, setErrorMessage] = useState("");
    // Navigation hook for route changes
    const navigate = useNavigate();
    // Action data for error feedback from server
    const actionData = useActionData();
    // State for form input values
    const [formData, setFormData] = useState({
        profileUsername: "",
        profileEmail: "",
        profilePassword: "",
        profilePasswordConfirm: ""
    });




    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md space-y-6">
        {/* Heading */}
    <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Create your account</h1>
        <p className="text-slate-400 text-sm mt-1">Join Job Tracker</p>
    </div>

    {/* Card */}
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-6">
        {/* Auth toggle */}
        <div className="flex gap-3 justify-center">
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
            >
                Login
            </button>
            <button
                type="button"
                className="px-4 py-2 rounded-lg bg-violet-600 text-white shadow hover:bg-violet-500 transition"
            >
                Sign Up
            </button>
        </div>

        <Form id="signup" method="post" className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
                <label className="block text-sm text-slate-300">Username</label>
                <div className="relative">
                    <ImProfile className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        name="profileUsername"
                        placeholder="e.g. john_doe"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        value={formData.profileUsername}
                        onChange={(e) => setFormData({ ...formData, profileUsername: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="block text-sm text-slate-300">Email</label>
                <div className="relative">
                    <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="email"
                        name="profileEmail"
                        placeholder="you@example.com"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        value={formData.profileEmail}
                        onChange={(e) => setFormData({ ...formData, profileEmail: e.target.value })}
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
                <label className="block text-sm text-slate-300">Password</label>
                <div className="relative">
                    <RiLockPasswordLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        name="profilePassword"
                        placeholder="••••••••"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        value={formData.profilePassword}
                        onChange={(e) => setFormData({ ...formData, profilePassword: e.target.value })}
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
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
                <label className="block text-sm text-slate-300">Confirm Password</label>
                <div className="relative">
                    <GiConfirmed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="profilePasswordConfirm"
                        placeholder="••••••••"
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        value={formData.profilePasswordConfirm}
                        onChange={(e) => setFormData({ ...formData, profilePasswordConfirm: e.target.value })}
                        required
                    />
                    <IconContext.Provider value={{ size: "1.25em" }}>
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                            {showConfirmPassword ? <BiHide /> : <BiShow />}
                        </button>
                    </IconContext.Provider>
                </div>
            </div>

            {/* Local + server error */}
            {(errorMessage || actionData?.error) && (
                <p className="text-rose-400 text-xs">{errorMessage || actionData?.error}</p>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={!formData.profileUsername || !formData.profileEmail || !formData.profilePassword || !formData.profilePasswordConfirm}
                className={`w-full rounded-lg py-2 font-medium text-white transition
                ${formData.profileUsername && formData.profileEmail && formData.profilePassword && formData.profilePasswordConfirm ? "bg-violet-600 hover:bg-violet-500" : "bg-slate-700 cursor-not-allowed"}`}
            >
                Sign Up
            </button>
        </Form>
    </div>
</div>
</div>
    )
}