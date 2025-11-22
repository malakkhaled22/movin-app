import { sendEmail } from "./utils/sendEmail";
import dotenv from "dotenv";
dotenv.config();
(async () => {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
  await sendEmail("malakkhaled178@gmail.com", "Test Email", "This is a test message");
})();
