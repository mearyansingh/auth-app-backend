import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // return res.json({ success: true, user: user });
        return res.json({
            success: true, userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });

    } catch (error) {
        return res.json({ success: false, error: error.message })
    }
}