import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
// import bcrypt from 'bcrypt';
// dotenv.config();


export const signup = async (req, res, next) => {
  const { username, email, password } = req.body //Receives username, email, p/word from req.body.
  const hashedPassword = bcryptjs.hashSync(password, 10)
  const newUser = new User({ username, email, password: hashedPassword })
  try {
    await newUser.save()
    res.status(201).json("User created successfully")
  } catch (error) {
    next(error) //Handled by the error handling middleware in index.js.
  }
}

export const signin = async (req, res, next) => {
  const { email, password } = req.body
  try {
    const validEmail = await User.findOne({ email }) //Check if email exists in the db.
    if (!validEmail) return next(errorHandler(404, "Email/User not found!")) //Error if none existent
    const validPassword = bcryptjs.compareSync(password, validEmail.password) //Checks p/word
    if (!validPassword) return next(errorHandler(401, "Wrong credentials")) //Error if invalid

    //Authenticating the user:
    const token = jwt.sign({ id: validEmail._id }, process.env.JWT_SECRET)
    const { password: pasiwadi, ...restOfUserInfo } = validEmail._doc //Donna wanna send p/word to user - rest of user info.
    //After creating the token, we want to save it as a cookie bbelow:
    res.cookie("access_token", token, { httpOnly: true }).status(200).json(restOfUserInfo)
  } catch (error) {
    next(error)
  }
}

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      const { password: pasiwadi, ...rest } = user._doc
      res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest)
    } else {
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      })
      await newUser.save()
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
      const { password: pasiwadi, ...rest } = newUser._doc
      res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest)
    }
  } catch (error) {
    next(error)
  }
}

// Add the facebook authentication function after the google function
export const facebook = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
      const { password: pasiwadi, ...rest } = user._doc
      res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest)
    } else {
      const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      const hashedPassword = bcryptjs.hashSync(generatePassword, 10)
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      })
      await newUser.save()
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
      const { password: pasiwadi, ...rest } = newUser._doc
      res.cookie("access_token", token, { httpOnly: true }).status(200).json(rest)
    }
  } catch (error) {
    next(error)
  }
}
export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("User has been signed out")
  } catch (error) {
    next(error)
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
//Forgot password added by me:
export const forgotPassword = (req, res) => {
  const { email } = req.body

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ Status: "User does not exist" })
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

      const transporter = nodemailer.createTransport({
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

//Reset password - added by me
//Reset password - updated
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
