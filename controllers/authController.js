import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";
import { cookieOptions } from "../config/cookieConfig.js";
// import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Input Validation using a library (e.g., express-validator)
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide a valid name' });
  }
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  // if (!name || !email || !password) {
  //     return res.status(400).json({ success: false, message: 'Please fill all fields' });
  // }

  try {
    // 2. Check if email already exists (consider case-insensitivity)
    if (email) {
      const existingUser = await userModel.findOne({ email: email.toLowerCase() }); // Convert email to lowercase for case-insensitive check
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already exists' }); // Use 409 Conflict status code
      }
    }
    // 3. Password Hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    // 4. Create and Save New User
    const newUser = new userModel({ name, email: email.toLowerCase(), password: hashedPassword }); // Store email in lowercase
    await newUser.save();
    // 5. JWT Token Generation
    // generateToken(res, user._id) //alternative
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // 6. Set HTTP-only Cookie
    res.cookie('token', token, cookieOptions);
    // 7. Sending Welcome Email (Consider moving this to a background job)
    try {
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to Auth App',
        // text: `Welcome to Auth App, ${name}!`,
        html: WELCOME_TEMPLATE.replace("{{name}}", name)
      }
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Optionally, you could inform the user that registration was successful but the welcome email failed to send.
    }
    // 8. Return Success Response with User Data (Optional but good practice)
    return res.status(201).json({ // Use 201 Created status code for successful resource creation
      success: true,
      message: 'User registered successfully!',
      userData: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        // You might want to include other non-sensitive user information here
      },
    });
  } catch (error) {
    console.error('Error during registration:', error); // Log the error for debugging
    return res.status(500).json({ success: false, message: 'Failed to register user. Please try again later.' });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Improved Input Validation
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address!' });
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please fill all fields!' });
  }
  try {
    // 2. Case-Insensitive Email Lookup
    const user = await userModel.findOne({ email: email.toLowerCase() });

    // 3. More Specific Error Message for User Not Found
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' }); // Use 401 for authentication failures
    }

    const isMatch = await bcrypt.compare(password, user.password);
    // await userModel.matchedPassword(password); // alternatively

    // 4. More Specific Error Message for Incorrect Password
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    // 5. JWT Token Generation
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 6. Set HTTP-only Cookie
    res.cookie('token', token, cookieOptions);
    // 7. Return User Data (Optional but good practice)
    return res.status(200).json({ success: true, message: 'Login successful!', userData: { id: user?._id, name: user.name, email: user.email, isAccountVerified: user.isAccountVerified } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again later.' });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({ success: true, message: 'Logged out successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed.Please try again later." });
  }
}

//send verification OTP to the user's email address
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified' });
    }
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 600000; // 10 minutes //24*60*60*1000->24hrs

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      // text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    }
    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: 'Verification OTP sent successfully!' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

//verify the email using the otp
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: 'Invalid details.' });
  }
  try {
    const user = await userModel.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    //check if otp is correct
    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP.' });
    }
    //check otp expiration
    if (user.verifyOtpExpireAt <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Verification OTP expired.' });
    }
    user.verifyOtp = '';
    user.verifyOtpExpireAt = 0;
    user.isAccountVerified = true;
    await user.save();
    return res.json({ success: true, message: 'Email verified successfully!', userData: { id: user?._id, name: user.name, email: user.email, isAccountVerified: user.isAccountVerified } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

//Check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true })
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

//send password reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.json({ success: false, message: 'Please provide an email.' });
  }
  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'Invalid email! Please provide valid email.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 600000; // 10 minutes //24*60*60*1000->24hrs

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'password reset OTP',
      // text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password. It will expire in 10 minutes.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    }
    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

//Reset user password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: 'Please provide all required details' });
  }

  try {
    const user = await userModel.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'User not found!' });
    }

    if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.json({ success: false, message: 'Incorrect OTP!' });
    }

    if (user.resetOtpExpireAt <= Date.now()) {
      return res.json({ success: false, message: 'OTP expired!' });
    }

    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.json({ success: true, message: 'Password reset successfully!' });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}
