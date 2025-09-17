import {z} from "zod/v4";
import type {Status} from "~/utils/interfaces/Status";


export const SignInSchema = z.object({
    profileEmail: z
        .email('Please provide a valid email address')
        .max(128, 'please provide a valid profileEmail (max 128 characters)'),
    profilePassword: z.string('Please provide a valid password')
        .min(8, 'password cannot be less than 8 characters')
        .max(32, 'password cannot be over 32 characters')
})

export type SignIn = z.infer<typeof SignInSchema>;
export async function postSignIn(data: SignIn): Promise<{result: Status, headers: Headers}> {
    const response = await fetch(`${process.env.REST_API_URL}/sign-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        throw new Error('Failed to sign in')
    }
    const headers = response.headers
    const result = await response.json();
    return {result, headers};
}