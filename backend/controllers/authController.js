import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/generateToken.js";
import dotenv from "dotenv";
import redis from '../lib/redis.js'
dotenv.config();

export const sendOtp = async (req, res) => {
  try {
    const { contactNumber } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const ttl = 300; // 5 minutes

    await redis.set(`otp:${contactNumber}`, otp, 'EX', ttl);

    console.log(`OTP for ${contactNumber}: ${otp}`); // 👉 Replace this with SMS sending

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};




export const signup = async (req, res) => {
  try {
    const { name, contactNumber, ownerCode, password, role, otp } = req.body;

    const exists = await User.findOne({ contactNumber });
    if (exists)
      return res.status(400).json({ message: 'Contact number already registered' });

    // ✅ Verify OTP from Redis
    const storedOtp = await redis.get(`otp:${contactNumber}`);
    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }
    if (storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // ✅ Proceed to create user
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
        return res.status(400).json({ message: 'Owner code is not valid' });
      } else {
        user.role = 'owner';
        await user.save();
      }
    }

    // ✅ Clean up OTP from Redis after successful signup
    await redis.del(`otp:${contactNumber}`);

    res.status(200).json({
      message: 'Signup successful',
      token: generateToken(user._id, res),
      user: {
        id: user._id,
        name: user.name,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed' });
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
