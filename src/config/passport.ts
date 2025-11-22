import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_REDIRECT_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const name = profile.displayName;
                const picture = profile.photos?.[0].value;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        name,
                        email,
                        profilePic: picture,
                        password: "",
                        isGoogleAuth: true,
                    });
                }
                const token = jwt.sign(
                    { id: user._id, email: user.email },
                    process.env.JWT_SECRET!,
                    { expiresIn: "7d" }
                );
                return done(null, { user, token });
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    const user = await User.findById(id);
    done(null, user);
});

export default passport;