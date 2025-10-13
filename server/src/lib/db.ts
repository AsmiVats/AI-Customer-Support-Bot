import mongoose from 'mongoose'
import 'dotenv/config';

export const connectDB = async()=>{
    try{
        const connection = mongoose.connect(process.env.MONGO_URL as string);
        console.log("Successfully connected to MongoDB");
    }catch(error){
        console.log("Error while connecting to MongoDD", error);
    }
}