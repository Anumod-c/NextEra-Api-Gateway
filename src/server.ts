import express from 'express';
import http from 'http'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import  morgan from 'morgan';
import fs from 'fs'
import  path from 'path'
import { initializeSocket } from './socket/socketServer';
import config from './config';
import { userRouter } from './modules/user/routes';
import { adminRouter } from './modules/admin/routes';
import { tutorRouter } from './modules/tutor/routes';
import {courseRouter} from './modules/course/routes'
import {  orderRouter } from './modules/orders/routes';
const app = express();

// CORS Configuration
const corsOptions = {
    origin:'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,// Allows cookies and credentials to be included   
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());


const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

app.use(morgan('combined'));  // Logs to the terminal
app.use(morgan('combined', { stream: logStream })); // Logs to the access.log file
app.use('/admin', adminRouter);
app.use('/tutor',tutorRouter);
app.use('/course',courseRouter);
app.use('/purchase',orderRouter)
app.use('/',userRouter);


const server =  http.createServer(app)
initializeSocket(server);
const  startServer =async()=>{
    try{
        server.listen(config.PORT,()=>{
            console.log(`ApiGateway running on port :${config.PORT}`)
        })
    }  catch(error){
        console.log("Couldnt start Api gateway")
    }
}
startServer()


