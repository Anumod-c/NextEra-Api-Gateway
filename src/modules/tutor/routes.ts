import express, { Router } from 'express';
import { tutorController } from './tutorController';
import authenticateToken from '../../middleware/authMiddleware';
import { tutorIsBlocked } from '../../middleware/IsBlockedMiddleware';

const tutorRouter = express.Router();
tutorRouter.post('/register',tutorController.register);
tutorRouter.post('/otp',tutorController.otp);
tutorRouter.post('/login',tutorController.login);
tutorRouter.post('/forgotPassword',tutorController.forgotPassword)
tutorRouter.post('/google_login',tutorController.googleLogin)
tutorRouter.post('/resetPassword',tutorController.resetPassword)
tutorRouter.get('/get-presigned-url', tutorController.getPresignedUrlForUpload);
tutorRouter.get('/get-presigned-url-download',tutorController.getPresignedUrlForDownload);
tutorRouter.get('/courseList',tutorIsBlocked,authenticateToken(['tutor']),tutorController.courseList);
tutorRouter.get('/payouts', tutorIsBlocked,authenticateToken(['tutor']),tutorController.payouts)
tutorRouter.get('/getTotalCoursesCount/:tutorId',authenticateToken(['tutor']),tutorController.getTotalCoursesCount)
tutorRouter.get('/getStudentsCount/:tutorId',authenticateToken(['tutor']),tutorController.getTotalStudentsCount)
tutorRouter.post('/additionalInfo',tutorController.additionalInfo)
tutorRouter.post('/editProfile',tutorController.editProfile)

tutorRouter.patch("/changeCourseStatus/:courseId",  authenticateToken(['tutor']),tutorController.changeCourseStatus)


export {tutorRouter}
