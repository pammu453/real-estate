import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { errorHandler } from '../utils/error.js'


export const signup = async (req, res, next) => {
    const { username, email, password } = req.body
    const validUsername = await User.findOne({ username })
    if (validUsername) return next(errorHandler(404, 'User alredy exist with this username'))
    const validEmail = await User.findOne({ email })
    if (validEmail) return next(errorHandler(404, 'User alredy exist with this email'))
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = new User({ username, email, password: hashedPassword })
    try {
        await newUser.save();
        res.status(201).json("User creted succesfully!")
    } catch (error) {
        next(error)
    }
}


export const signin = async (req, res, next) => {
    const { email, password } = req.body
    const url = 'https://65437a5f51a8cc58443fbc61--kaleidoscopic-banoffee-437e71.netlify.app';
    const parsedDomain = new URL(url).hostname;
    try {
        const validUser = await User.findOne({ email })
        if (!validUser) return next(errorHandler(404, 'User not found!'))

        const validPassword = bcrypt.compareSync(password, validUser.password)
        if (!validPassword) return next(errorHandler(401, 'Invalid credentials!'))

        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)
        const { password: pass, ...rest } = validUser._doc

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'None',
        //     domain: parsedDomain,
        //     path: '/',
        // }).status(200).json(rest)

             res.status(200).json({token,rest})

    } catch (error) {
        next(error)
    }
}

export const google = async (req, res, next) => {
    const url = 'https://65437a5f51a8cc58443fbc61--kaleidoscopic-banoffee-437e71.netlify.app';
    const parsedDomain = new URL(url).hostname;
    try {
        const user = await User.findOne({ email: req.body.email })

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            const { password: pass, ...rest } = user._doc
            // res.cookie('token', token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'None',
            //     domain: parsedDomain,
            //     path: '/',
            // }).status(200).json(rest)

            res.status(200).json({token,rest})
        } else {
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            const hashedPassword = bcrypt.hashSync(generatePassword, 10)

            const newUser = new User({
                username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.photo
            })

            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
            const { password: pass, ...rest } = newUser._doc
            // res.cookie('token', token, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'None',
            //     domain: parsedDomain,
            //     path: '/',
            // }).status(200).json(rest)

            res.status(200).json({token,rest})
        }
    } catch (error) {
        next(error)
    }
}

export const signout = (req, res) => {
    try {
        res.clearCookie("Token")
        res.status(200).json("User has been logged out!")
    } catch (error) {
        next(error)
    }
}