import express from "express"
import {
  signin,
  signup,
  google,
  signout,
  forgotPassword,
  resetPassword,
  facebook,
} from "../controllers/auth.controller.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.post("/google", google)
router.post("/facebook", facebook)
router.get("/signout", signout)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:id/:token", resetPassword)

export default router
