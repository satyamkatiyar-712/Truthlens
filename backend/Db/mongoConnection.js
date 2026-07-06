import mongoose from "mongoose"

export const ConnectDb= async(url)=>{
     
    await mongoose.connect(url)
    console.log("MongoDb is ready to be used")
}