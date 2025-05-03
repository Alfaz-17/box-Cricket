// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const protectedRoute = async (req, res, next) => {
    try {
        // Ensure cookies are parsed correctly (cookie-parser middleware should be used)
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }

        // Find user by decoded ID
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to next middleware

    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({ message: "Internal server error in protectRoute" });
    }
};
