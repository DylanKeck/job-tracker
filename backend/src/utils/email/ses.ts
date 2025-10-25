import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
    region: process.env.SES_REGION,
    credentials: {
        accessKeyId: process.env.SES_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.SES_SECRET_ACCESS_KEY as string,
    },
});

export async function sendEmail({
                                    to,
                                    subject,
                                    html,
                                    text,
                                    from = process.env.SES_FROM as string,
                                }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}) {
    const cmd = new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
                Html: { Data: html, Charset: "UTF-8" },
                Text: text ? { Data: text, Charset: "UTF-8" } : undefined,
            },
        },
        // If you later add an SES Configuration Set:
        // ConfigurationSetName: process.env.SES_CONFIG_SET,
    });

    return ses.send(cmd);
}
