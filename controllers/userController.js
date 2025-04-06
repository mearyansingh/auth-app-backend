import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    const userId = req?.body?.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // return res.json({ success: true, user: user });
    return res.status(200).json({
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
export const getUserProfile = async (req, res) => {
  try {
    const userId = req?.body?.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req?.body?.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    return res.status(200).json({ success: true, message: 'Profile updated successfully!', userUpdatedData: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
