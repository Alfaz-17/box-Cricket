import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../lib/generateToken.js';
import dotenv from 'dotenv';
import Otp from '../models/Otp.js';
import { sendEmail } from '../lib/emailService.js';
import { AuthRequest } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();

// Notice the types added to req, res, and next
export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, action } = req.body;

    const userExists = await User.findOne({ email });

    if (action === 'signup') {
      if (userExists) {
        res.status(400).json({ message: 'Account already exists! Please log in instead.' });
        return;
      }
    } else if (action === 'forgot-password') {
      if (!userExists) {
        res.status(404).json({ message: 'Account not found. Please sign up first.' });
        return;
      }
    } else {
      res.status(400).json({ message: 'Invalid action' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    await Otp.deleteMany({ contactNumber: email });
    await Otp.create({ contactNumber: email, otp });

    console.log(`Sending OTP to ${email}`);

    try {
      await sendEmail(
        email, 
        'Your BookMyBox Verification Code', 
        `Your OTP is ${otp}. It is valid for 5 minutes.`
      );
    } catch (emailError: any) {
      console.error('Email OTP send failed:', emailError.message);
    }

    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    // Now we use next(error) so the global error handler catches it!
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const storedOtpDoc = await Otp.findOne({ contactNumber: email });
    
    if (!storedOtpDoc) {
      res.status(400).json({ message: 'OTP expired or not found' });
      return;
    }

    if (storedOtpDoc.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    res.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('OTP verify error:', error);
    next(error);
  }
};

export const completeSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, contactNumber, ownerCode, password, role } = req.body;

    const exists = await User.findOne({ email, role: 'user' });
    if (exists) {
      res.status(400).json({ message: 'Account already exists! Please log in instead.' });
      return;
    }

    if (ownerCode && ownerCode !== process.env.OWNER_CODE) {
      res.status(400).json({ message: 'Owner code is not valid' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      contactNumber,
      password: hashed,
      role,
      ownerCode,
    });
    await user.save();

    await Otp.deleteMany({ contactNumber });
    
    const token = generateToken(user._id as string);
    res.status(200).json({
      message: 'Signup successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'Account not found. Please sign up first to continue.' });
      return;
    }

    if (!user.password) {
      res.status(400).json({ message: 'Please login with Google' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }
    
    const token = generateToken(user._id as string);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        contactNumber: user.contactNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const forgotPas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { contactNumber, otp, newPas } = req.body;

    const numberExist = await User.findOne({ contactNumber });

    if (!numberExist) {
      res.status(404).json({ message: 'This number is not registered' });
      return;
    }

    const storedOtpDoc = await Otp.findOne({ contactNumber });
    if (!storedOtpDoc) {
      res.status(400).json({ message: 'OTP expired or not found' });
      return;
    }

    if (storedOtpDoc.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPas, 10);

    await User.findOneAndUpdate({ contactNumber }, { password: hashedPassword });
    await Otp.deleteMany({ contactNumber });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

// Notice we use "AuthRequest" here instead of "Request" because it has the "user" property!
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'user not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log('error in get me controller', error);
    next(error);
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ message: 'Logout successfully...' });
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

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
    ).select('-password -otp');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, role = 'user', action, ownerCode } = req.body;

    let email, name, picture, googleId;

    if (token.startsWith('ya29.')) {
      // It's an Access Token
      const { data } = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      email = data.email;
      name = data.name;
      picture = data.picture;
      googleId = data.sub;
    } else {
      // It's an ID Token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ message: 'Invalid Google token' });
        return;
      }
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    }

    let user = await User.findOne({ email });

    if (action === 'login') {
      if (!user) {
        res.status(404).json({ message: 'Account not found. Please sign up first to continue.' });
        return;
      }
      // If user exists but doesn't have a googleId linked yet, link it
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.profileImg && picture) user.profileImg = picture;
        await user.save();
      }
    } else if (action === 'signup') {
      if (user) {
        res.status(400).json({ message: 'Account already exists! Please log in instead.' });
        return;
      }
      if (role === 'owner') {
        if (ownerCode !== process.env.OWNER_CODE) {
          res.status(400).json({ message: 'Owner code is not valid' });
          return;
        }
      }
      // Create new user if they don't exist
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        profileImg: picture,
        role,
        ownerCode: role === 'owner' ? ownerCode : null,
      });
    } else {
      res.status(400).json({ message: 'Action (login or signup) is required' });
      return;
    }

    const jwtToken = generateToken(user._id as string);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
        profileImg: user.profileImg,
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-password -ownerCode');
    res.status(200).json(users);
  } catch (error) {
    console.log('error in getAll user controller');
    next(error);
  }
};
