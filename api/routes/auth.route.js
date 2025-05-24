import express from "express"
import {
  google,
  signin,
  signup,
  signout,
  forgotPassword,
  resetPassword,
  facebook,
} from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", signup) //Signup function comes from auth.controller.
router.post("/signin", signin)
router.post("/google", google)
router.post("/facebook", facebook) // Added Facebook authentication
router.get("/signout", signout)
router.post("/forgot-password", forgotPassword) //Added by me
router.post("/reset-password/:id/:token", resetPassword) //Added by me

export default router
