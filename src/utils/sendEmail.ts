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