import mongoose from "mongoose";

const Otpschema=mongoose.Schema({
      email:{
        type:String,
        unique:true,
        required:true
      },
      otp:{
        type:String,
        required:true
      },
      createdAt:{
          type: Date,
         default: Date.now,
          expires:300
      }
})

export const OTP= mongoose.model("Otp",Otpschema)