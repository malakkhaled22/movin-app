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
        return res.json({accessToken, refreshToken});
        //return res.redirect(
          //  `movin://auth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
        //);
    }
);

export default router;