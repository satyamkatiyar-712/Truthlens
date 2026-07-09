import nodemailer from "nodemailer";

export const sendOTPVerificationEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Tera Gmail (e.g., satyam@gmail.com)
                pass: process.env.EMAIL_PASS, // Gmail ka 16-digit App Password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify Your Truthlens Account",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Welcome to Truthlens!</h2>
                    <p>Your OTP for email verification is:</p>
                    <h1 style="color: #0ea5e9; letter-spacing: 5px;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Could not send email");
    }
};