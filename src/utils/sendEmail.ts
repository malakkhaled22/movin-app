import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Movin Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message,
        };

        console.log("📨 Sending email now...");
        const info = await transporter.sendMail(mailOptions);
        console.log("📨 Email sent...");
        console.log("📨 Email sent successfully to:", to);
        console.log("✅ Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Email could not be sent");
    }
};