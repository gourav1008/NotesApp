import mongoose, { Mongoose } from 'mongoose'

const dbconnect = async ()=>{
    try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfuly!");
       
    } catch (error){
        console.error('MongoDB Connection Unsuccessfull!',error);
        process.exit(1) // exit with faluire.
    }
}

export default dbconnect;