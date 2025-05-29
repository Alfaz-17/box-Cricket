import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/generateToken.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
  try {
    const { name, contactNumber, ownerCode,password, role, otp } = req.body;

    const exists = await User.findOne({ contactNumber });
    if (exists)
      return res
        .status(400)
        .json({ message: "Contact number already registered" });

    // ✅ Optionally: Verify OTP here (if using external OTP service)
    // if (otp !== "expectedOtp") return res.status(400).json({ message: "Invalid OTP" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      contactNumber,
      password: hashed,
      role,
      ownerCode,
    });
 if (ownerCode) {
  if (ownerCode !== process.env.OWNER_CODE) {
    return res.status(400).json({ message: "owner code is not valid" });
  } else {
    user.role = "owner";
    await user.save();
  }
}


    res.status(200).json({
      message: "Signup successful",
      token: generateToken(user._id, res),
      user: {
        id: user._id,
        name: user.name,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { contactNumber, password } = req.body;

    const user = await User.findOne({ contactNumber });
    if (!user)
      return res.status(400).json({ message: "Invalid contact number" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id, res),
      user: {
        id: user._id,
        username: user.username,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "user not founded" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
    console.log("erroe in get me controller", error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logout successfully..." });
};
