import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    password: { type: String, required: true, unique: true },// should not be unique unless using username login
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },

}, { timestamps: true });

// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// })

/**
 * Compares an entered password with the user's hashed password.
 * @function matchPasswords
 * @param {string} enteredPassword - The password entered by the user for comparison.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, false otherwise.
 */
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password)
// }
const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;