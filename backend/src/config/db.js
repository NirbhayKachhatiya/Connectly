import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(ENV.MONGO_URI);
        console.log("MongoDB connected succesfully !");
    }
    catch(error){
        console.log("Couldn't connect to MongoDB : ",error);
        process.exit(1);
    }
}