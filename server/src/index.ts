import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js';
import authRoutes from './routes/user.route.js'
import sessionRoutes from './routes/session.route.js'
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT;


app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.text());
connectDB();

app.use('/api/auth',authRoutes);
app.use('/api/session',sessionRoutes);

app.listen(PORT,()=>{
    console.log("Server is listening on PORT:",PORT);
})