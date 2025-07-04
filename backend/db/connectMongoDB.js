import mongoose from "mongoose"

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn}`)
    } catch (error) {
        console.error(`Error in connecting mongodb: ${error.message}`)
        process.exit(1)
    }
}

export default connectMongoDB