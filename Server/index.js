import "./env.js"
// const express = require('express');
import express from 'express';
import {Server} from 'socket.io'
import cors from 'cors';
import http from 'http'
import path from 'path';
import {fileURLToPath} from 'url'
import cookieParser from 'cookie-parser';
import connectionDB from './config/dbConn.js';
import roomRoutes from './routes/roomRouters.js'
import userRoutes from './routes/userRouters.js'
import setupSocket from './socket.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));
app.use(cookieParser());


// --- Serve uploaded files statically ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Middleware to parse JSON
app.use(express.json());

app.use('/api/room',roomRoutes );
app.use('/api/user',userRoutes );

const httpServer=http.createServer(app);

const io=new Server (httpServer,{
    cors:{
        origin:process.env.FRONTEND_URL,
        methods:['GET','POST'],
    },
});

setupSocket(io);
connectionDB();
// Start the server
httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});