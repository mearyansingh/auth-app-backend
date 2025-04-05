import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
// import asyncHandler

export const protect = asyncHandler(async (req, response, next) => {
    let token
    token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await userModel.findById(decoded.id).select('-password');
            next()

        } catch (error) {
            return response.status(401).json({ success: false, message: 'Not authorized, invalid token!' })
        }
    } else {
        return response.status(401).json({ success: false, message: 'Not authorized, no token provided!' })
    }
})