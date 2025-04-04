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
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cors({ origin: allowedOrigins, credentials: true })) //send the cookie in the response
// app.options('*', cors()); // Preflight before any routes
app.use(cookieParser())
// Add body-parsing middleware
app.use(express.json()) //It parses incoming requests with JSON payloads and is based on body-parser
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('Request from origin:', req.headers.origin);
    next();
});

//API endpoints
app.get('/', (req, res) => {
    res.send('Auth app running')
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})