// import sgMail from "@sendgrid/mail";
//import dotenv from "dotenv";

// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// export const sendEmail = async (to: string, subject: string, message: string) => {
//     try {
//         const msg = {
//             to,
//             from: process.env.SENDGRID_VERIFIED_SENDER!,
//             subject,
//             text: message,
//         };

//         console.log("📨 Sending email via SendGrid...");
//         const info = await sgMail.send(msg);
//         console.log("✅ Email sent successfully to:", to);
//         return info;
//     } catch (error: any) {
//         console.error("❌ Error sending email via SendGrid:", error.response?.body || error);
//         throw new Error("Email could not be sent");
//     }
// };


import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Movin App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        });

        console.log("✅ Email sent successfully");
    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw new Error("Email could not be sent");
    }
};