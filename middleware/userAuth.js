import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.json({ success: false, message: 'Access denied. No token provided.' })
    }
    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        if (tokenDecode.id) {
            req.body = req.body || {};  // Ensure req.body exists
            req.body.userId = tokenDecode.id
        } else {
            return res.json({ success: false, message: 'Access denied. Invalid token.' })
        }
        next()
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export default userAuth;