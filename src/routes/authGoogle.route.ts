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
        console.log("CALL BACK HIT");
        console.log("USER:", req.user);
        return res.redirect(
            `movin://auth-success?token=${req.user.token}`
        );
    }
);

export default router;