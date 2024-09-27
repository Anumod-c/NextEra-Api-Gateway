import express, { Router } from 'express';
import { tutorController } from './tutorController';


const tutorRouter = express.Router();
tutorRouter.post('/register',tutorController.register);
tutorRouter.post('/otp',tutorController.otp);
tutorRouter.post('/login',tutorController.login);
tutorRouter.post('/forgotPassword',tutorController.forgotPassword)
tutorRouter.post('/google_login',tutorController.googleLogin)
tutorRouter.post('/resetPassword',tutorController.resetPassword)
tutorRouter.get('/get-presigned-url', tutorController.getPresignedUrlForUpload);
tutorRouter.get('/get-presigned-url-download', tutorController.getPresignedUrlForDownload);
tutorRouter.get('/courseList',tutorController.courseList);
tutorRouter.get('/payouts',tutorController.payouts)


export {tutorRouter}