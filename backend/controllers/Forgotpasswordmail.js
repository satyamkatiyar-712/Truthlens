import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, 
      secure: true,
      family: 4, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"Truthlens Support" <${process.env.EMAIL_USER}>`, // Custom naam dikhega inbox me
      to: email,
      subject: "🔒 Reset Your Truthlens Password",
      html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-w-md; margin: auto; padding: 30px; border-radius: 12px; background-color: #0a0a0a; color: #e5e7eb; border: 1px solid #262626; text-align: center;">
                    <h2 style="color: #ffffff; margin-bottom: 10px;">Truthlens</h2>
                    <p style="font-size: 16px; color: #a3a3a3;">We received a request to reset your password.</p>
                    
                    <div style="margin: 30px 0; padding: 20px; background-color: #171717; border-radius: 8px; border: 1px solid #333;">
                        <p style="font-size: 14px; color: #a3a3a3; margin-bottom: 10px;">Your Verification Code:</p>
                        <h1 style="color: #ffffff; letter-spacing: 8px; margin: 0; font-size: 32px;">${otp}</h1>
                    </div>
                    
                    <p style="font-size: 14px; color: #737373;">This code is valid for the next <b>5 minutes</b>.</p>
                    <p style="font-size: 12px; color: #525252; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Password Reset Email sent successfully to:", email);
  } catch (error) {
    console.error("Password Reset Email sending failed:", error);
    throw new Error("Could not send email");
  }
};
