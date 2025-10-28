// src/utils/email/resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
                                    to, subject, html, from = process.env.RESEND_FROM as string,
                                }: { to: string; subject: string; html: string; from?: string }) {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw error;
}
