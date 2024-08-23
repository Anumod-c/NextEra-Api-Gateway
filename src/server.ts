import express from 'express';
import http from 'http'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import { userRouter } from './modules/user/routes';
import { adminRouter } from './modules/admin/routes';
import { tutorRouter } from './modules/tutor/routes';

const app = express();

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true, 
    methods: "GET,POST,PUT,PATCH,HEAD,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    preflightContinue: false,
    optionsSuccessStatus: 204
};


app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());


app.use('/admin', adminRouter);
app.use('/tutor',tutorRouter);
app.use('/',userRouter);


const server =  http.createServer(app)
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

