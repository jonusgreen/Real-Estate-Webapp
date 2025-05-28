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
    phone: {
      type: String,
      required: false,
      validate: {
        validator: (v) => {
          // Allow empty string or valid phone number (10 digits for US)
          return !v || /^\d{10}$/.test(v)
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    contactPreference: {
      type: String,
      enum: ["email", "phone", "both"],
      default: "email",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true },
)

// Add index for better query performance
userSchema.index({ username: 1 })
userSchema.index({ email: 1 })
userSchema.index({ phone: 1 })

// Virtual for formatted phone display
userSchema.virtual("formattedPhone").get(function () {
  if (!this.phone || this.phone.length !== 10) return this.phone
  return `(${this.phone.slice(0, 3)}) ${this.phone.slice(3, 6)}-${this.phone.slice(6)}`
})

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true })

// Check if model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User
