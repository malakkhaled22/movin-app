import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import dotenv from "dotenv";
import { createNotificationForUser } from "../services/notifications.service";
import { logAdminActivity } from "../services/adminActivity.service";

dotenv.config();

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
                if(!email)
                    return done(new Error("Google email not found"), false);

                let user = await User.findOne({ email });
                let newUserCreated = false;
                if (!user) {
                    console.log("NEW GOOGLE USER REGISTERED: ", email);
                    newUserCreated = true;
                    user = await User.create({
                        username: name,
                        email,
                        phone: null,
                        location: "",
                        bio: "",
                        favorites: [],
                        isAdmin: false,
                        isBuyer: false,
                        isSeller: false,
                        canSwitchRole: true,
                        isGoogleAuth: true,
                        isVerified: true,
                    });
                }else{
                    console.log("GOOGLE USER LOGGED IN: ", email);
                }
                const fullUser = await User.findById(user._id).select("-password");
                if(!fullUser) return done(new Error("User not found after creation"), false);

                const { accessToken, refreshToken } = generateToken({
                    _id: String(fullUser._id),
                    isAdmin: fullUser.isAdmin,
                    isSeller: fullUser.isSeller,
                    isBuyer: fullUser.isBuyer,
                });
                fullUser.refreshToken = refreshToken;
                await fullUser.save();
                
                if(newUserCreated) {
                    await createNotificationForUser({
                    userId: fullUser.id.toString(),
                    title: "Account Verified with Google ✅",
                    body: "Your email has been verified successfully with Google. You can now use all features.",
                    type: "alert",
                    action: {
                        screen: "Profile",
                        entityId: fullUser.id.toString(),
                    }
                });
                await logAdminActivity({
                    type: "user",
                    title: "New user registered with Google ✅",
                    description: fullUser.email,
                    icon: "user"
                });
                }
                return done(null, { 
                    user: fullUser,
                    accessToken,
                    refreshToken,
                });
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

export default passport;