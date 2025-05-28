import nodemailer from "nodemailer"

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Send email to landlord
export const sendEmail = async (req, res) => {
  try {
    console.log("Email send request received:", req.body)

    const { to, subject, message, senderName, senderEmail, senderPhone, propertyName, propertyId } = req.body

    // Validate required fields
    if (!to || !subject || !message || !senderName || !senderEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(senderEmail) || !emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      })
    }

    // Create transporter
    const transporter = createTransporter()

    // Verify transporter configuration
    try {
      await transporter.verify()
      console.log("Email transporter verified successfully")
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError)
      return res.status(500).json({
        success: false,
        message: "Email service configuration error",
      })
    }

    // Create email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 10px 0;">New Property Inquiry</h2>
          <p style="color: #666; margin: 0;">You have received a new inquiry about your property listing.</p>
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Property Details</h3>
          <p style="margin: 5px 0;"><strong>Property:</strong> ${propertyName}</p>
          ${propertyId ? `<p style="margin: 5px 0;"><strong>Property ID:</strong> ${propertyId}</p>` : ""}
        </div>

        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Contact Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${senderName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${senderEmail}" style="color: #007bff;">${senderEmail}</a></p>
          ${senderPhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${senderPhone}" style="color: #007bff;">${senderPhone}</a></p>` : ""}
        </div>

        <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #333; margin: 0 0 15px 0;">Message</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #1976d2; font-size: 14px;">
            <strong>Reply directly to this email to respond to ${senderName}</strong>
          </p>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent through Exela Realtors' Estate contact system.</p>
        </div>
      </div>
    `

    // Plain text version
    const textContent = `
New Property Inquiry

Property: ${propertyName}
${propertyId ? `Property ID: ${propertyId}` : ""}

Contact Information:
Name: ${senderName}
Email: ${senderEmail}
${senderPhone ? `Phone: ${senderPhone}` : ""}

Message:
${message}

---
Reply directly to this email to respond to ${senderName}.
This email was sent through Exela Realtors' Estate contact system.
    `

    // Email options
    const mailOptions = {
      from: {
        name: "Exela Realtors' Estate",
        address: process.env.EMAIL_USERNAME,
      },
      to: to,
      replyTo: senderEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    }

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      replyTo: mailOptions.replyTo,
    })

    // Send email
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.messageId)

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    })
  } catch (error) {
    console.error("Error sending email:", error)

    // Provide specific error messages
    let errorMessage = "Failed to send email"
    if (error.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check email credentials."
    } else if (error.code === "ECONNECTION") {
      errorMessage = "Failed to connect to email server. Please try again later."
    } else if (error.responseCode === 550) {
      errorMessage = "Invalid recipient email address."
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Test email configuration
export const testEmailConfig = async (req, res) => {
  try {
    const transporter = createTransporter()
    await transporter.verify()

    res.status(200).json({
      success: true,
      message: "Email configuration is valid",
    })
  } catch (error) {
    console.error("Email configuration test failed:", error)
    res.status(500).json({
      success: false,
      message: "Email configuration is invalid",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
