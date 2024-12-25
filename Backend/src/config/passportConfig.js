import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // Check if username is provided
            if (!username || !password) {
                return done(null, false, { message: "Username and password are required" });
            }

            // Find the user (case-insensitive)
            const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") });

            // User not found
            if (!user) {
                return done(null, false, { message: "User not found" });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                return done(null, user); // Authentication successful
            } else {
                return done(null, false, { message: "Incorrect password" });
            }
        } catch (error) {
            console.error("Error during authentication:", error.message);
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    console.log("Inside serializeUser");
    done(null, user._id); // Serialize the user's ID
});

passport.deserializeUser(async (_id, done) => {
    try {
        console.log("Inside deserializeUser");
        const user = await User.findById(_id);
        if (!user) {
            return done(null, false, { message: "User not found during deserialization" });
        }
        done(null, user); // Attach user object to `req.user`
    } catch (error) {
        console.error("Error during deserialization:", error.message);
        done(error);
    }
});
