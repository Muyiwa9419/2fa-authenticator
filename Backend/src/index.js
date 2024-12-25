import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js"; 
import "./config/passportConfig.js";

dotenv.config();
dbConnect().catch((error) => {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
});

const app = express();

// Middlewares
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || "default_secret", // Update for production
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 6000 * 60,
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "strict",
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);

// Error Handling
app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down gracefully...");
    await mongoose.connection.close();
    process.exit(0);
});

