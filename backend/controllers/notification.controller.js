import Notification from "../models/notification.model.js"

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const notifications = await Notification.find({to: userId}).populate({
            path: "from",
            select:"username profileImg"
        })
        await Notification.updateMany({to: userId}, {read: true})
        
        res.status(200).json(notifications)
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        await Notification.deleteMany({to: userId})
        res.status(200).json({success: true, message: "Notificatons are deleted"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const notId = req.params.id 
        const userId = req.user._id
        const notification = await Notification.findById(notId)
        if (!notification)
            return res.status(404).json({success: false, message: "Notification not found"})
        if (notification.to.toString() !== userId.toString())
            return res.status(403).json({success: false, message: "You are not aouthorized to delete this notification"})
        await Notification.findByIdAndDelete(notId)

        res.status(200).json({success: true, message: "Notificatio deleted successfully"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}
