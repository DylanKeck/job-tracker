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


export function meta({}: Route.MetaArgs) {
    return [
        { title: "Commonality" },
        { name: "description", content: "please sign in or sign up" },
    ];
}


const formSchema = SignInSchema
const resolver = zodResolver(formSchema)

export async function action({request}: Route.ActionArgs) {
    try {

        const { errors, data, receivedValues: defaultValues } =
            await getValidatedFormData<SignIn>(request, resolver);
        if (errors) {
            // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
            return { errors, defaultValues };
        }

        const session = await getSession(
            request.headers.get("Cookie")
        )


        const validatedData = SignInSchema.parse(data);

        const {result, headers} = await postSignIn(validatedData);

        const authorization = headers.get('authorization');

        const expressSessionCookie = headers.get('Set-Cookie');
        if(result.status !== 200 || !authorization) {
            return {success: false, error: result.message, status: 400};
        }

        const parsedJwtToken = jwtDecode(authorization) as any
        const validationResult = ProfileSchema.safeParse(parsedJwtToken.auth);

        if(!validationResult.success) {
            session.flash('error', 'profile is malformed')
            return {success: false, error: 'internal server error try again later', status: 400}
        }
        session.set('authorization', authorization);
        session.set('profile', validationResult.data)
        const responseHeaders = new Headers()
        responseHeaders.append('Set-Cookie', await commitSession(session))

        if(expressSessionCookie) {
            responseHeaders.append('Set-Cookie', expressSessionCookie);

        }

        return redirect('/', {headers: responseHeaders});
    } catch (error) {
        console.error('Sign-in action error:', error);
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 500};
    }
}

export default function Login() {
    const actionData = useActionData<{success: boolean; validationErrors?: any; error?: string}>()


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
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMessage = searchParams.get("message");

    const profileEmail = watch("profileEmail") ?? "";
    const profilePassword = watch("profilePassword") ?? "";

    const isFormComplete = profileEmail.length > 0 && profilePassword.length > 0;
    const buttonDisabled =
        isSubmitting ||
        Object.keys(errors).length > 0 ||
        profilePassword.length < 8 ||
        !isFormComplete;


    const [showToast, setShowToast] = useState(!!initialMessage);
    const [message, setMessage] = useState(initialMessage);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <>
            <div className="container mx-auto text-center">
                {showToast && message && (
                    <div className="flex items-center justify-between bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 shadow-md">
                        <span className="block sm:inline">{message}</span>
                        <button
                            className="ml-4"
                            onClick={() => setShowToast(false)}
                            aria-label="Close"
                        >
                            <AiOutlineClose className="h-5 w-5 text-green-700" />
                        </button>
                    </div>
                )}
                <h1 className="text-4xl sm:text-5xl font-extrabold text-center pt-10 text-gray-900 tracking-tight">Welcome to Commonality</h1>
                <p className="text-2xl">Shared Interests. Real Connections.</p>
                <div className="text-white flex flex-col items-center justify-center w-full bg-white shadow-xl rounded-3xl p-6 pb-10 space-y-10 transition-all">
                    <div className="flex space-x-4 mb-6">
                        <button className="bg-gradient-to-br from-blue-500 to-blue-400 text-white px-4 py-2 rounded-lg shadow transition">
                            Login
                        </button>
                        <button className="hover:cursor-pointer bg-gradient-to-br from-gray-500 to-gray-400 text-white px-4 py-2 rounded-lg shadow hover:to-indigo-700 transition" onClick={() => navigate('/signup')}>
                            Sign Up
                        </button>
                    </div>

                    <Form method="post" onSubmit={handleSubmit} id="login-form" className="bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg p-6 rounded-xl space-y-4 w-full max-w-sm" >

                        <div className='relative'>
                            <MdOutlineEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"/>
                            <input
                                type="email"
                                {...register("profileEmail")}
                                placeholder="Email"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                required
                            />
                        </div>
                        {errors?.profileEmail ? <p className="text-red-500">{errors?.profileEmail.message}</p> : null}
                        <div className='relative'>
                            <RiLockPasswordLine
                                className="absolute left-3 top-1/5 transform -translate-y-1/2 text-white"/>

                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("profilePassword")}
                                placeholder="Password"
                                className="w-full p-2 pl-10 rounded bg-zinc-500 text-white"
                                required
                            />
                            <IconContext.Provider value={{size: '1.5em'}}>
                                <button type='button'
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className='text-sm text-white absolute right-2 top-1/5 transform -translate-y-1/2'>{showPassword ?
                                    <BiHide/> : <BiShow/>
                                }</button>
                            </IconContext.Provider>
                            {errors?.profilePassword ? <p className="text-red-500">{errors?.profilePassword.message}</p> : null}
                            <button className=" flex justify-start text-blue-400 text-sm hover:text-red-600 hover:cursor-pointer my-2">Forgot Password?</button>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-br from-green-400 to-green-500 hover:cursor-pointer hover:to-green-600 p-2 rounded text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed" disabled={buttonDisabled}

                            >Login
                            </button>
                        </div>
                    </Form>
                    {actionData?.error && (
                        <div className="text-red-500 text-sm mb-4">
                            {actionData.error}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}