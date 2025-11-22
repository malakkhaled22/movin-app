import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import userRoutes from "./routes/auth.routes";
import authOtpRoutes from "./routes/authOtp.routes";
import passport from "./config/passport";
import session from "express-session";
import GoogleAuthRoutes from "./routes/authGoogle.route";

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
    secret: "someSecretKeyy",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
//User Routes
app.use("/api/auth", userRoutes);
app.use("/api/auth", authOtpRoutes);
app.use("/api/auth", GoogleAuthRoutes);

app.set('trust proxy', 1); // أو app.set('trust proxy', true);
// ----------------------------------------------------------------

// تعريف وتطبيق الـ Rate Limiter بعد تفعيل trust proxy
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);
app.get("/", (req, res) => {
    res.send("Backend server is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
