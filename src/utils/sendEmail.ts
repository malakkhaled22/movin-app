import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true = 465, false = 587
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

        /*********/////////// */
        sendEmail("youremail@gmail.com", "Test Email", "Hello from Railway!")
        .then(() => console.log("Email sent"))
        .catch(err => console.error("Email failed", err));
        //////////////////////////
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