const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, trim: true,
      lowercase: true, minlength: 2, maxlength: 30, unique: true
    },
    password: { type: String, required: true, select: false },
    isLoggedIn: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lastLoginAttempt: { type: Date },
    ipAddress: { type: String, trim: true },
  },
  { timestamps: true }
);

// ✅ 모델 “자체”를 export (중요)
module.exports = mongoose.model('User', userSchema);