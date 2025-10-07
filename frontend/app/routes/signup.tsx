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
        <>
            <div className="container mx-auto text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center pt-10 text-gray-900 tracking-tight">Welcome to Job Tracker</h1>
                <p className="text-2xl">Welcome to Job Tracker.</p>
                <div className="text-white flex flex-col items-center justify-center w-full bg-white shadow-xl rounded-3xl p-6 pb-10 space-y-10 transition-all">
                    {/* Error message above form */}
                    <div className="flex space-x-4 mb-6">
                        {/* Login and Sign Up buttons */}
                        <button className="hover:cursor-pointer bg-gradient-to-br from-gray-500 to-gray-400 text-white px-4 py-2 rounded-lg shadow hover:to-indigo-700 transition" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="bg-gradient-to-br from-blue-500 to-blue-400 text-white px-4 py-2 rounded-lg shadow transition">
                            Sign Up
                        </button>
                    </div>
                    <Form id="signup" method="post" className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg p-6 rounded-xl space-y-4 w-full max-w-sm">
                        <div className='relative'>
                            {/* Username input with icon */}
                            <ImProfile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                            <input
                                type="text"
                                name="profileUsername"
                                placeholder="Username"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                value={formData.profileUsername}
                                onChange={(e) => setFormData({...formData, profileUsername: e.target.value})}
                                required
                            />
                        </div>
                        <div className='relative'>
                            {/* Email input with icon */}
                            <MdOutlineEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                            <input
                                type="email"
                                name="profileEmail"
                                placeholder="Email"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                value={formData.profileEmail}
                                onChange={(e) => setFormData({...formData, profileEmail: e.target.value})}
                                required
                            />
                        </div>
                        <div className='relative'>
                            {/* Password input with icon and show/hide toggle */}
                            <RiLockPasswordLine
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="profilePassword"
                                placeholder="Password"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                value={formData.profilePassword}
                                onChange={(e) => setFormData({...formData, profilePassword: e.target.value})}
                                required
                            />
                            <IconContext.Provider value={{size: '1.5em'}}>
                                <button type='button'
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className='text-sm text-white absolute right-2 top-1/2 transform -translate-y-1/2'>{showPassword ?
                                    <BiHide/> : <BiShow/>
                                }</button>
                            </IconContext.Provider>
                        </div>
                        <div className='relative'>
                            {/* Confirm password input with icon and show/hide toggle */}
                            <GiConfirmed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="profilePasswordConfirm"
                                placeholder="Confirm Password"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                value={formData.profilePasswordConfirm}
                                onChange={(e) => setFormData({...formData, profilePasswordConfirm: e.target.value})}
                                required
                            />
                            <IconContext.Provider value={{size: '1.5em'}}>
                                <button type='button'
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className='text-sm text-white absolute right-2 top-1/2 transform -translate-y-1/2'>{showConfirmPassword ?
                                    <BiHide/> : <BiShow/>}</button>
                            </IconContext.Provider>
                        </div>
                        {/* Local error message display */}
                        {errorMessage && <p className='text-red-600 text-sm '>{errorMessage}</p>}
                        {/* Submit button disables if any field is empty */}
                        <button
                            type="submit"
                            className={`w-full p-2 rounded text-white ${formData.profileUsername && formData.profileEmail && formData.profilePassword && formData.profilePasswordConfirm ? 'bg-gradient-to-br from-green-400 to-green-500 hover:cursor-pointer hover:to-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={
                                !formData.profileUsername ||
                                !formData.profileEmail ||
                                !formData.profilePassword ||
                                !formData.profilePasswordConfirm
                            }
                        >Sign Up
                        </button>
                        {/* Server error message display */}
                        <p className="text-red-600 text-sm text-center min-h-[1.25rem]">
                            {actionData?.error || ""}
                        </p>
                    </Form>

                </div>
            </div>
        </>
    )
}