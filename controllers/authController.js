import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    try {
        if (email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 86400000 * 7 //24*60*60*1000 ->7 days in milliseconds
        });
        // html: "<a href='https://devaryan.me'>Click for more info</a>", // html body
        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Auth App',
            text: `Welcome to Auth App, ${name}!`,
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }
    try {
        const user = await userModel.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Incorrect password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 86400000 * 7 //24*60*60*1000 ->7 days in milliseconds
        });
        return res.json({ success: true, message: 'Login successful!' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });
        return res.json({ success: true, message: 'Logged out successfully!' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
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
        return res.json({ success: true, message: 'Email verified successfully!' });
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
            return res.json({ success: false, message: 'User not found.' });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Incorrect OTP.' });
        }

        if (user.resetOtpExpireAt <= Date.now()) {
            return res.json({ success: false, message: 'OTP expired.' });
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