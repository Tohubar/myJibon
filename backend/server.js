import express from "express"
import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"
import authRoutes from "./routers/auth.routers.js"
import userRoutes from "./routers/user.routes.js"
import postRoutes from "./routers/post.routes.js"
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"

const app = express()
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})
app.use(express.json())
app.use(express.urlencoded({extended: true})) // to parse form data
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectMongoDB()
})