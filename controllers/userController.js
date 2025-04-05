import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req?.body?.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // return res.json({ success: true, user: user });
        return res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (error) {
        return res.json({ success: false, error: error.message })
    }
}


export const getUserProfile = (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        return res.json({ success: true, user });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.dob = req.body.dob || user.dob;
        user.address = req.body.address || user.address;

        await user.save();
        return res.json({ success: true, message: 'Profile updated successfully!' });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}