import jwt from "jsonwebtoken";

export const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //check for https:
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //prevent CSRF attacks
        maxAge: 86400000 * 7 //24*60*60*1000 ->7 days in milliseconds
    });
    return token;

}