import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/generateToken.js";
import dotenv from "dotenv";
import redis from "../lib/redis.js";
import { connection } from "../lib/redisClient.js";
import { sendMessage } from "../lib/whatsappBot.js";
dotenv.config();

export const sendOtp = async (req, res) => {
  try {

    // add action for diffrefnt aaspact
    const { contactNumber, action } = req.body;

    const userExists = await User.findOne({ contactNumber });

    if (action === "signup") {
      if (userExists) {
        return res
          .status(400)
          .json({ message: "Contact number already registered" });
      }
    } else if (action === "forgot-password") {
      if (!userExists) {
        return res
          .status(404)
          .json({ message: "Contact number not registered" });
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const ttl = 300; // 5 minutes


    //set otp in redis
    await redis.set(`otp:${contactNumber}`, otp, "EX", ttl);

    //send message in whatsapp using chatBot
    try {
await redis.publish(
  "whatsapp:send",
  JSON.stringify({
    number: `91${contactNumber}`,   // India numbers with +91
    text: `Your OTP is ${otp}`
  })
);

    } catch (error) {
      console.log(error,"error in redis publish")
    }

// inside backend auth or booking controller
    console.log(`OTP for ${contactNumber}: ${otp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {

    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { contactNumber, otp } = req.body;

    // Check OTP from Redis
    const storedOtp = await connection.get(`otp:${contactNumber}`);
    if (!storedOtp) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("OTP verify error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

export const completeSignup = async (req, res) => {
  try {
    const { name, contactNumber, ownerCode, password, role } = req.body;

    const exists = await User.findOne({ contactNumber, role: "user" });
    if (exists)
      return res
        .status(400)
        .json({ message: "Contact number already registered" });

    //  add ownerCode and check if it vlaid or not
    if (ownerCode) {
      if (ownerCode !== process.env.OWNER_CODE) {
        return res.status(400).json({ message: "Owner code is not valid" });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      contactNumber,
      password: hashed,
      role,
      ownerCode,
    });
    await user.save();
    // ✅ Cleanup OTP from Redis after signup
    await connection.del(`otp:${contactNumber}`);
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Signup successful",
      token,
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
    // ▶️ NEW: token returned in JSON only
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
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

export const forgotPas = async (req, res) => {
  try {
    const { contactNumber, otp, newPas } = req.body;

    const numberExist = await User.findOne({ contactNumber });

    if (!numberExist) {
      return res.status(404).json({ message: "This number is not registered" });
    }

    const storedOtp = await redis.get(`otp:${contactNumber}`);
    if (!storedOtp) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPas, 10);

    await User.findOneAndUpdate(
      { contactNumber },
      { password: hashedPassword }
    );

    // Optional: delete OTP from Redis
    await redis.del(`otp:${contactNumber}`);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
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

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, contactNumber, profileImg } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(contactNumber && { contactNumber }),
          ...(profileImg && { profileImg }),
        },
      },
      { new: true }
    ).select("-password -otp");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password ").select("-ownerCode");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json("intenal server error ");
    console.log("error in getAll user controller");
  }
};
