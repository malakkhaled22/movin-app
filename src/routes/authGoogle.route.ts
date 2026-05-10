import { Router } from "express";
import passport from "passport";
const router = Router();

router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "movin://auth-failed",
        session: false,
    }),
    async (req: any, res) => {
        console.log("USER:", req.user);
        console.log("ACCESS: ", req.user.accessToken);
        console.log("REFRESH: ", req.user.refreshToken);
        const accessToken = req.user.accessToken;
        const refreshToken = req.user.refreshToken;
        const userId = req.user.user._id;
        return res.redirect(
            `movin://auth-success?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}&userId=${userId}`
        );
    }
);
export default router;