import bcrypt from 'bcrypt'
import { USER } from "../models/useSchema.js";
import { accessToken, refreshToken } from "../utils/jwtTokens.js";
import jwt from "jsonwebtoken";
import { sendOTPVerificationEmail } from "./Sendotpforsignup.js";
import { OTP } from "../models/Storeotp.js";


export const forgotPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required!" });
        }

       
        const user = await USER.findOne({ email }); 
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email!" });
        }


        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

       
        await OTP.deleteMany({ email }); 
        await OTP.create({ email, otp: generatedOtp });

       
        await sendOTPVerificationEmail(email, generatedOtp);

        return res.status(200).json({ success: true, message: "OTP sent successfully to your email." });

    } catch (error) {
        console.error("Forgot Password OTP Error:", error);
        return res.status(500).json({ success: false, message: "Server error in sending OTP" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

      
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP has expired. Please request again." });
        }
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP!" });
        }

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

       
        await USER.findOneAndUpdate(
            { email }, 
            { password: hashedPassword }
        );


        await OTP.deleteMany({ email });

        return res.status(200).json({ success: true, message: "Password reset successful! You can now log in." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ success: false, message: "Server error during password reset" });
    }
};

export const SendOtp = async (req, res) => {
     try {
          const { email } = req.body
          const existinguser = await USER.findOne({ email })

          if (existinguser) {
               return res.status(400).json({ success: false, message: "Email is already registered!" })
          }

          const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

          await OTP.deleteMany({ email })

          await OTP.create({
               email,
               otp: generatedOtp
          })

          await sendOTPVerificationEmail(email, generatedOtp);

          return res.status(200).json({ success: true, message: "OTP sent successfully" })

     }
     catch(error){
          console.error("Send OTP Error:", error);
          return res.status(500).json({ success: false, message: "Server error in sending OTP" });
     }
}

export const SignupUser = async (req, res) => {
     try {
          const { name, email, password,otp } = req.body;

          if (!email || !password || !name) {
               return res.status(400).json({ success: false, message: "Please provide full details for Signing up" });
          }

          const user = await USER.findOne({ email });
          if (user) {
               return res.status(409).json({ success: false, message: "User is already registered" });
          }

          const otpRecord = await OTP.findOne({email})

          if(!otpRecord){
               return res.status(400).json({
                    success:false,
                    message:"Otp is expired!"
               })
          }

          if(otpRecord.otp!=otp){
               return res.status(400).json({ success: false, message: "Invalid OTP!" });
          }

          const newUser = new USER({
               name,
               email,
               password,
          });
          await newUser.save();

          await OTP.deleteMany({email})

          newUser.password = undefined;

          return res.status(201).json({
               success: true,
               message: "User created successfully",
               newUser,
          });
     } catch (error) {
          console.error("Signup Error:", error);
          return res.status(500).json({ success: false, message: "Internal server error" });
     }
};

export const Loginuser = async (req, res) => {
     try {
          const { email, password } = req.body;

          if (!email || !password) {
               return res.status(400).json({ success: false, message: "Please provide all details" });
          }
          const existingUser = await USER.findOne({ email });
          if (!existingUser) {
               return res.status(401).json({ success: false, message: "User does not exist" });
          }

          const isMatch = await existingUser.isPasswordCorrect(password);
          if (!isMatch) {
               return res.status(401).json({ success: false, message: "Invalid password" });
          }

          const AccessToken = accessToken(existingUser);
          const RefreshToken = refreshToken(existingUser);

          existingUser.RefreshToken = RefreshToken;
          await existingUser.save();

          return res
               .cookie("accessToken", AccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
               })
               .cookie("refreshToken", RefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
               })
               .status(200)
               .json({
                    success: true,
                    message: "Login successful",
               });
     } catch (error) {
          console.error("Login Error:", error);
          return res.status(500).json({ success: false, message: "Internal server error" });
     }
};

export const LogoutUser = async (req, res) => {
     try {
          const user = await USER.findById(req.user.userId);

          if (!user) {
               return res.status(404).json({ success: false, message: "User not found" });
          }

          user.RefreshToken = null;
          await user.save();

          const cookieOptions = {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
          };

          res.clearCookie("accessToken", cookieOptions);
          res.clearCookie("refreshToken", cookieOptions);

          return res.status(200).json({
               success: true,
               message: "Logout successful",
          });
     } catch (error) {
          console.error("Logout Error:", error);
          return res.status(500).json({ success: false, message: "Internal server error" });
     }
};

export const RenewAccesstoken = async (req, res) => {
     try {
          const tokenFromCookie = req.cookies?.refreshToken;

          if (!tokenFromCookie) {
               return res.status(401).json({ success: false, message: "Unauthorized" });
          }

          let decoded;

          try {
               decoded = jwt.verify(tokenFromCookie, process.env.REFRESH_TOKEN_KEY);
          } catch (error) {
               return res.status(401).json({ success: false, message: "Invalid or expired Token" });
          }

          const user = await USER.findById(decoded.userId);
          if (!user) {
               return res.status(410).json({ success: false, message: "User account no longer existed" });
          }

          if (tokenFromCookie !== user.RefreshToken) {
               return res.status(401).json({ success: false, message: "The Token is compromised login again!" });
          }

          // 🛠️ BUG 2 FIXED: Changed 'existingUser' to 'user'
          const AccessToken = accessToken(user);
          const RefreshToken = refreshToken(user);

          // 🛠️ BONUS FIX: Save the newly generated refresh token back to the database!
          user.RefreshToken = RefreshToken;
          await user.save();

          return res
               // 🛠️ BUG 3 FIXED: Changed 'newAccesstoken' to 'AccessToken'
               .cookie("accessToken", AccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
               })
               .cookie("refreshToken", RefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
               })
               .status(200)
               .json({
                    success: true,
                    message: "Token renewed successfully",
               });
     } catch (error) {
          console.error("Renew Token Error:", error);
          return res.status(500).json({ success: false, message: "Internal server error" });
     }
};


export const Profile= async(req,res)=>{
        try{
          const userId= req.user.userId;
           const loginuser= await USER.findById(userId)
           if(!loginuser){
               return res.status(401).json({
                    success:false,
                    message:"Please login again to see your profile!",
                    code: "No_user"
               })
           }
           return res.status(200).json({
                success:true,
                user:{name:loginuser.name}
           })
        } 
        catch(error){
              console.log("Server error",error);
              return res.status(500).json({ 
                   success:false,
                   message:"Server is not responding"
              })
        }
}