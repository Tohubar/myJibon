import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ success: false, message: "Invalid Email Format..." });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ success: false, message: "Username is already taken." });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ success: false, message: "Email is already taken." });
		}

		if (password.length < 6) {
			return res.status(400).json({ success: false, message: "Password should be at least 6 characters." });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		if (newUser) {
			await newUser.save();
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
				success: true,
			});
		} else {
			res.status(400).json({ success: false, message: "Invalid user data" });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });
		const isValidPass = await bcrypt.compare(password, user ? user.password : "");

		if (!user || !isValidPass) {
			return res.status(400).json({ success: false, message: "Username or password is not correct" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(201).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
			success: true,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ success: true, message: "Logout successful" });
	} catch (error) {
		res.status(500).json({ success: false, message: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ success: false, error: "Internal Server Error" });
	}
};
