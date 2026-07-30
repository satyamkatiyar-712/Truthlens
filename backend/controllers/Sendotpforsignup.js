import { Resend } from "resend";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPVerificationEmail = async (email, otp) => {
    try {
        await resend.emails.send({
            from: "Acme <onboarding@resend.dev>", 
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
        });

        console.log("Email sent successfully to:", email);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Could not send email");
    }
};