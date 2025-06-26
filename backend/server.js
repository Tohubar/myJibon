import express from "express"
import dotenv from "dotenv"
import path from "path"
import { v2 as cloudinary } from "cloudinary"
import authRoutes from "./routers/auth.routers.js"
import userRoutes from "./routers/user.routes.js"
import postRoutes from "./routers/post.routes.js"
import notificationRoutes from "./routers/notification.route.js"
import connectMongoDB from "./db/connectMongoDB.js"
import cookieParser from "cookie-parser"

const app = express()
const __dirname = path.resolve()
dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})
app.use(express.json({limit: "5mb"})) // limit should not be too much to prevet DoS
app.use(express.urlencoded({extended: true})) // to parse form data
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")))
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectMongoDB()
})