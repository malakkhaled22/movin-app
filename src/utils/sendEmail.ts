import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        const msg = {
            to,
            from: process.env.SENDGRID_VERIFIED_SENDER!,
            subject,
            text: message,
        };

        console.log("📨 Sending email via SendGrid...");
        const info = await sgMail.send(msg);
        console.log("✅ Email sent successfully to:", to);
        return info;
    } catch (error: any) {
        console.error("❌ Error sending email via SendGrid:", error.response?.body || error);
        throw new Error("Email could not be sent");
    }
};
