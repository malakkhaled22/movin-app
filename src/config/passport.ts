import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import dotenv from "dotenv";

dotenv.config();

console.log("GoogleRedirectURL", process.env.GOOGLE_REDIRECT_URL);
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_REDIRECT_URL!,
        },
        async (googleAccessToken, googleRefreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                const name = profile.displayName;

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        username: name,
                        email,
                        isGoogleAuth: true,
                        isVerified: true,
                    });
                }

                const { accessToken, refreshToken } = generateToken({
                    _id: String(user._id),
                    isAdmin: user.isAdmin,
                    isSeller: user.isSeller,
                    isBuyer: user.isBuyer,
                });
                user.refreshToken = refreshToken;
                await user.save();
                return done(null, { user, accessToken, refreshToken });
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;