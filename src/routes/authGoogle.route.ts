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
        failureRedirect: "/login",
        session: false,
    }),
    async (req: any, res) => {

        return res.status(200).json({
            message: "Google login successful 🎉",
            user:req.user.user,
            token:req.user.token,
        });
    }
);

export default router;