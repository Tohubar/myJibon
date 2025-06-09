import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js"

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json ({succes: false, messsage: "Invalid Email Format..."})
        }
        const existingUser = await User.findOne({ username }) // username: username => username
        console.log("checkin useranaem")
        if (existingUser) {
            return res.status(400).json ({succes: false, messsage: "UserName is Already Taken."})
        }
        const existingEmail = await User.findOne({ email }) // username: username => username
        console.log("checkin email")
        if (existingEmail) {
            return res.status(400).json ({succes: false, messsage: "Email is Already Taken."})
        }
        if (password.length < 6) {
            return res.status(400).json({succes: false, messsage: "Password should be atleast 6 charactersf"})
        }
        //hashing password
        const salt = await bcrypt.genSalt(10)
        console.log("creating hash")
        const hashedPassword = await bcrypt.hash(password, salt)
        console.log("hased pass")
        const newUser = new User ({
            fullName,
            username,
            email,
            password: hashedPassword,
        })
        if (newUser) {
            generateTokenAndSetCookie(User._id, res)
            await newUser.save()

            res.status(201).json ({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers:newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        }else {
            res.status(400).json({succes: false, messsage: "Invalid User data"})
        }
    } catch (error) {
        res.status(500).json({succes: false, messsage: "Internal Server error"})
    }
}
export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({username})
        const isValidPass = await bcrypt.compare(password, user? user.password : "") 
        if (!user || !isValidPass) {
            return res.status(400).json({succes: false, message: "Username or password is not correct"})
        }

        generateTokenAndSetCookie(user._id, res)
        res.status(201).json ({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers:user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })
    
    } catch (error) {
        res.status(500).json({succes: false, messsage: "Internal Server error"})
    }
}
export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        res.status(200).json({succes: true, message: "Logout Successful"})
    } catch (error) {
        res.status(500).json({succes: false, messsage: "Internal Server error"})
    }
}
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({succes: false, messsage: "Internal Server error"})
    }
}