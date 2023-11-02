import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config();

import userRouter from '../server/routes/user.route.js'
import authRouter from '../server/routes/auth.route.js'
import listingRouter from '../server/routes/listing.route.js'

const app = express()


const corsOptions = {
    origin: 'https://6543cc9e453afd0f5d13b70f--fabulous-rabanadas-b727f2.netlify.app', 
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

app.use("/api/user", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/listing", listingRouter)

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to the database!')
    }).catch((error) => {
        console.log(error.message)
    })

app.listen(5000, () => {
    console.log('Server is running on port 5000!')
})

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    })
})
