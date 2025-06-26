import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"

//models
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"

export const getUserProfile = async (req, res) => {
    const {username} = req.params

    try {
        const user = await User.findOne({username}).select("-password")
        if (!user) return res.status(400).json({success: false, message: "User not found"})

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({success: false, message: "Error to get user profile"})
    }
}

export const followUnfollowUser = async (req, res) => {
    const { id } = req.params

    try {
        const userToModify = await User.findById(id)
        const currentUsr = await User.findById(req.user._id)

        if (id === req.user._id.toString()) return res.status(400).json({success: false, message: "You can not follow/unfollow yourselt"})
        if (!userToModify || !currentUsr) return res.status(400).json({success: false, message: " Usr not Found"})
        
        const isFollowing = currentUsr.following.includes(id)
        if (isFollowing) {
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
            //TODO return the id of the user as a response
            res.status(200).json({success: true, message: "User Unfollowed Succesfully"})
        }else {
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
            //send notification to user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save()
            //TODO return the id of the user as a response
            res.status(200).json({success: true, message: "User followed Succesfully"})
        }
    } catch (error) {
        res.status(500).json({success: false, message: "Internal error.."})
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id
        const userFollowedByMe = await User.findById(userId).select("following")
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId,}
                }
            },
            {$sample: { size: 10 }}
        ])
        const filteredUsers = users.filter((user) => !userFollowedByMe.following.includes(user._id)) 
        const suggestedUsers = filteredUsers.slice(0, 4);
        suggestedUsers.forEach(user => user.password = null)

        res.status(200).json(suggestedUsers)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const updateUser = async (req, res) => {
    const { username, fullName, email, currentPassword, newPassword, bio, link} = req.body
    let {profileImg, coverImg} = req.body
    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if (!user) 
            return res.status(404).json({success: false, message: "User not found"})
        if ((!currentPassword && newPassword) || (currentPassword && !newPassword))
            return res.status(400).json({success: false, message: "Please provide both current and new password"})
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) 
                return res.status(400).json({success: false, message: "Wrong password"})
            if (newPassword < 6) 
                return res.status(400).json({success: false, message: "Password must be atleast 6 length"})
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)
        }
        if (profileImg) {
            if (user.profileImg)
                //http://cloudinary/... //... // id.png -> we need the 'id' of image 
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }
        if (coverImg) {
            if (user.coverImg)
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }
        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.username = username || user.username
        user.password = newPassword || user.password
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg
        user.bio = bio || user.bio
        user.link = link || user.link

        await user.save()
        /// won't pass password in response
        user.password = null
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}