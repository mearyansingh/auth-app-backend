import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' })
    }
    // Verify token and get user ID from it. If token is invalid, return 401 Unauthorized error.
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if (!tokenDecode?.id) {
            return res.status(401).json({ success: false, message: 'Access denied. Invalid token.' })
        }
        req.body = req.body || {};  // Ensure req.body exists
        // req.userId = tokenDecode.id//alternative
        req.body.userId = tokenDecode.id
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized access.' })
    }
}

export default userAuth;