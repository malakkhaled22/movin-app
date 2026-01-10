import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import userRoutes from "./routes/auth.routes";
import authOtpRoutes from "./routes/authOtp.routes";
import roleRoutes from "./routes/role.routes";
import passport from "./config/passport";
import GoogleAuthRoutes from "./routes/authGoogle.route";
import rateLimit from "express-rate-limit";
import propertyRoutes from "./routes/properties.routes";
import favoriteRoutes from "./routes/favorite.routes";
import notifyRoutes from "./routes/notifications.routes";
import adminRoutes from "./routes/admin.routes";
import reportRoutes from "./routes/report.routes";
import path from "path";

dotenv.config();
connectDB();

const app = express();
const allowed = ['https://movin-app.vercel.app'];

app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://movin-app.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/auth", authOtpRoutes);
app.use("/api/auth", GoogleAuthRoutes);
app.use("/api/auth", roleRoutes);
app.use("/api/seller", propertyRoutes);
app.use("/api/buyer", favoriteRoutes);
app.use("/api/notifications", notifyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

app.set('trust proxy', 2);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.get("/", (req, res) => {
    res.send("Backend server is running 🚀");
});

// Serve Angular frontend
const frontendPath = path.join(__dirname, 'public', 'browser');
app.use(express.static(frontendPath));

// Angular fallback route
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
