import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

export const signup = async (req, res, next) => {
  const { username, email, password, phone } = req.body

  try {
    console.log("Signup attempt for email:", email)
    console.log("Phone number received:", phone) // Debug log

    // Check if email already exists
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() })
    if (existingEmailUser) {
      console.log("Email already exists:", email)
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email address or sign in to your existing account.",
      })
    }

    // Check if username already exists
    const existingUsernameUser = await User.findOne({ username })
    if (existingUsernameUser) {
      console.log("Username already exists:", username)
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose a different username.",
      })
    }

    // Check if phone number already exists (if provided and not empty)
    if (phone && phone.trim() !== "") {
      const existingPhoneUser = await User.findOne({ phone })
      if (existingPhoneUser) {
        console.log("Phone number already exists:", phone)
        return res.status(400).json({
          success: false,
          message: "Phone number already exists. Please use a different phone number.",
        })
      }
    }

    // Hash password
    const hashedPassword = bcryptjs.hashSync(password, 10)

    // Prepare user data
    const userData = {
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    }

    // Only add phone if it's provided and not empty
    if (phone && phone.trim() !== "") {
      userData.phone = phone
    }

    console.log("Creating user with data:", userData) // Debug log

    // Create new user
    const newUser = new User(userData)
    await newUser.save()

    console.log("New user created successfully:", newUser.username)
    console.log("User phone saved as:", newUser.phone) // Debug log

    res.status(201).json({
      success: true,
      message: "User created successfully! You can now sign in.",
    })
  } catch (error) {
    console.error("Signup error:", error)

    // Handle specific MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      let message = ""

      switch (field) {
        case "email":
          message = "Email already exists. Please use a different email address or sign in to your existing account."
          break
        case "username":
          message = "Username already exists. Please choose a different username."
          break
        case "phone":
          message = "Phone number already exists. Please use a different phone number."
          break
        default:
          message = "Account with this information already exists."
      }

      return res.status(400).json({
        success: false,
        message,
      })
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      })
    }

    next(error)
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const validEmail = await User.findOne({ email: email.toLowerCase() }) //Check if email exists in the db.
    if (!validEmail) return next(errorHandler(404, "Email/User not found!")) //Error if none existent
    const validPassword = bcryptjs.compareSync(password, validEmail.password) //Checks p/word
    if (!validPassword) return next(errorHandler(401, "Wrong credentials")) //Error if invalid

    //Authenticating the user:
    const token = jwt.sign(
      {
        id: validEmail._id,
        isAdmin: validEmail.isAdmin || false,
      },
      process.env.JWT_SECRET,
    )
    const { password: pasiwadi, ...restOfUserInfo } = validEmail._doc //Donna wanna send p/word to user - rest of user info.

    console.log("Setting cookie for user:", validEmail._id, "isAdmin:", validEmail.isAdmin)

    //After creating the token, we want to save it as a cookie below:
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
      .status(200)
      .json(restOfUserInfo)
  } catch (error) {
    next(error)
  }
}

export const google = async (req, res, next) => {
  try {
    console.log("Google auth request received:", req.body)
    const { name, email, photo } = req.body

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required Google account information",
      })
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      console.log("Existing Google user found:", user.email)

      // Update user info if needed
      const updates = {}
      if (photo && photo !== user.avatar) {
        updates.avatar = photo
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates)
        console.log("Updated user info:", updates)
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = user._doc

      console.log("Google auth - Setting cookie for existing user:", user._id, "isAdmin:", user.isAdmin)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({ ...rest, avatar: updates.avatar || rest.avatar })
    } else {
      console.log("Creating new Google user:", email)

      // Generate unique username
      const baseUsername = name.split(" ").join("").toLowerCase()
      let username = baseUsername
      let counter = 1

      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Generate random password for Google users
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)

      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        authProvider: "google",
        isEmailVerified: true, // Google emails are pre-verified
      })

      await newUser.save()
      console.log("New Google user created:", newUser.username)

      // Generate token
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = newUser._doc

      console.log("Google auth - New user, setting cookie for:", newUser._id)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json(rest)
    }
  } catch (error) {
    console.error("Google auth error:", error)
    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    })
  }
}

export const facebook = async (req, res, next) => {
  try {
    console.log("Facebook auth request received:", req.body)
    const { name, email, photo } = req.body

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required Facebook account information",
      })
    }

    // Check if user already exists
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user) {
      console.log("Existing Facebook user found:", user.email)

      // Update user info if needed
      const updates = {}
      if (photo && photo !== user.avatar) {
        updates.avatar = photo
      }

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, updates)
        console.log("Updated user info:", updates)
      }

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = user._doc

      console.log("Facebook auth - Setting cookie for existing user:", user._id, "isAdmin:", user.isAdmin)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json({ ...rest, avatar: updates.avatar || rest.avatar })
    } else {
      console.log("Creating new Facebook user:", email)

      // Generate unique username
      const baseUsername = name.split(" ").join("").toLowerCase()
      let username = baseUsername
      let counter = 1

      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Generate random password for Facebook users
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)

      const newUser = new User({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        authProvider: "facebook",
        isEmailVerified: true, // Facebook emails are pre-verified
      })

      await newUser.save()
      console.log("New Facebook user created:", newUser.username)

      // Generate token
      const token = jwt.sign(
        {
          id: newUser._id,
          isAdmin: newUser.isAdmin || false,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      const { password: pasiwadi, ...rest } = newUser._doc

      console.log("Facebook auth - New user, setting cookie for:", newUser._id)

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        })
        .status(200)
        .json(rest)
    }
  } catch (error) {
    console.error("Facebook auth error:", error)
    res.status(500).json({
      success: false,
      message: "Facebook authentication failed. Please try again.",
    })
  }
}

export const signout = (req, res, next) => {
  try {
    console.log("Signing out user, clearing cookie")
    res.clearCookie("access_token").status(200).json("User has been signed out")
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = (req, res) => {
  const { email } = req.body

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ Status: "User does not exist" })
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

      const transporter = nodemailer.createTransporter({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${user._id}/${token}`

      const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: "Reset Password Link",
        text: resetURL,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending reset email:", error)
          return res.status(500).json({ Status: "Failed to send reset email" })
        }
        console.log("Reset email sent:", info.response)
        return res.json({ Status: "Success" })
      })
    })
    .catch((err) => {
      console.error("Error in forgot password:", err)
      return res.status(500).json({ Status: "Internal server error" })
    })
}

export const resetPassword = async (req, res) => {
  const { id, token } = req.params
  const { password } = req.body

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.id !== id) {
      return res.status(400).json({ Status: "Invalid token" })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const updatedUser = await User.findByIdAndUpdate(
      id, // Corrected usage of id
      { password: hashedPassword },
      { new: true }, // Return the updated user document
    )

    if (!updatedUser) {
      return res.status(404).json({ Status: "User not found" })
    }

    return res.json({ Status: "Success" })
  } catch (error) {
    console.error("Error with token:", error)
    return res.status(400).json({ Status: "Error with token" })
  }
}
