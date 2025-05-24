import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String, // Field to store password reset token
    resetPasswordExpires: Date, // Field to store password reset token expiration date
  },
  { timestamps: true },
)

// Add index for better query performance
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })

// Check if model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
