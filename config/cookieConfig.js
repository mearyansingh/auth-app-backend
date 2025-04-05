export const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 86400000 * 7 // 7 days in milliseconds
};
// res.cookie('token', token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//     maxAge: 86400000 * 7 //24*60*60*1000 -> 7 days in milliseconds
// });