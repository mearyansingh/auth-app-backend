import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
connectDB()

//initialize express app
const app = express()
const port = process.env.PORT || 3000

//middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://mernapp-auth.vercel.app'], //send the cookie in the response
    credentials: true // enable cookies
}))

app.use(cookieParser())
app.use(express.json())//parse row json //body-parsing middleware - It parses incoming requests with JSON payloads and is based on body-parser
// when your application needs to receive and process JSON data in the request body
app.use(express.urlencoded({ extended: true }));

//API endpoints
app.get('/', (req, res) => {
    res.send('Welcome! to Auth app.')
})

//error handling middleware
// app.use(notFound);
// app.use(errorHandler);

//routes
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

/**
 * Initializes the main application by connecting to MongoDB and setting up a basic route.
 * This function establishes a connection to the MongoDB database using the URL specified
 * in the environment variables. It also sets up a simple GET route for the root path ('/').
 */
// async function main() {
//     await mongoose.connect(process.env.MONGODB_URI);
//     app.get('/', (req, res) => {
//         res.send('Welcome! to Auth app...')
//     })
// }
// main().then(() => console.log("mongodb connected successfully!")).catch((err) => {
//     console.log("Failed to connect to MongoDB, retrying in 5 seconds...", err)
//     setTimeout(main, 5000);
// });
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})