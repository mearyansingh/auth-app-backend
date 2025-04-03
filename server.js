import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';

const port = process.env.PORT || 3000

connectDB()

//initialize express app
const app = express()

const allowedOrigins = ['http://localhost:5173', 'https://mernapp-auth.vercel.app']

//middleware
app.use(cors({ origin: allowedOrigins, credentials: true })) //send the cookie in the response
app.use(cookieParser())
// Add body-parsing middleware
app.use(express.json()) //It parses incoming requests with JSON payloads and is based on body-parser
// app.use(express.urlencoded({ extended: true }));
//API endpoints
app.get('/', (req, res) => {
    res.send('Auth app running')
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})