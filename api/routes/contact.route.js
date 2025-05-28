import express from "express"
import { sendEmail, testEmailConfig } from "../controllers/contact.controller.js"

const router = express.Router()

// Send email to landlord
router.post("/send-email", sendEmail)

// Test email configuration
router.get("/test-config", testEmailConfig)

export default router
