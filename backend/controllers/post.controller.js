import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        })

        if (posts.length === 0)
            return res.status(200).json([])
        return res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id

        const user = await User.findById(userId)
        if (!user) 
            return res.status(404).json({success: false, message: "User not found"})
        if (!text && !img) 
            return res.status(400).json({success: false, message: "Post must have text or image"})
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        })
        await newPost.save()
        res.status(200).json(newPost) 
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post)
            return res.status(404).json({success: false, message: "post not found"})
        if (post.user.toString() !== req.user._id.toString())
            return res.status(401).json({success: false, message: "You are not authorized to delete this post"})
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(req.params.id)
        
        res.status(200).json({success: true, message: "Post is Deleted successfully.."})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id
        if (!text) 
            return res.status(400).json({success: false, messsage: "Text should not be empty"})
        const post = await Post.findById(postId)
        if (!post) 
            return res.status(404).json({success: false, message: "post not found"})
        const comment = {user: userId, text}
        post.comments.push(comment)
        await post.save()

        res.status(200).json(post)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post)
            return res.status(404).json({success: false, message: "Post not found"})
        const userLikedPost = post.likes.includes(userId)

        if (userLikedPost) {
            //Unlike post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}})
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})
            res.status(200).json({success: true, message: "Post disliked successfully"})
        }else {
            //like post
            post.likes.push(userId)
            await post.save()
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})

            const newNotification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            })
            await newNotification.save()
            res.status(200).json({success: true, message: "You liked the post"})
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const getLikedPost = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({success: false, message: "User not found"})
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(likedPosts)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({success: false, messsage: "User not found"})
        const feedPosts = await Post.find({user: {$in: user.following}}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(feedPosts)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({ username })
        if (!user)
            return res.status(404).json({success: false, messsage: "User not found"})
        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}