import jwt from "jsonwebtoken"

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15d'
    })

    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000, // in miliseconds
        httpOnly: true, // this will prevent XSS attack, cross-stie scripting attack
        sameSite: 'strict', // prevent CSRF attack, cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
    })
}