import mongoose from "mongoose"
import bcrypt from 'bcrypt'
const userSchema= mongoose.Schema({
     name:{
        type:String,
        required:true,
     },
     email:{
        type:String,
        required:true, 
        unique:true,
        lowercase:true,
        trim:true
     },
     password:{
        type:String,
        required:true,
     },
     RefreshToken: {
         type: String,
         default: null
     }
},{timestamps:true}) 
 
userSchema.pre("save",async function (next) {
     if(!this.isModified("password")) return;
     this.password= await bcrypt.hash(this.password,10);
})

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password);
}

export const USER=mongoose.model("User",userSchema);