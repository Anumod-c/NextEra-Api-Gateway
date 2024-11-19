import express, { Router } from 'express';
import { tutorController } from './tutorController';
import authenticateToken from '../../middleware/authMiddleware';
import { isTutorBlocked } from '../../middleware/IsBlockedMiddleware';

const tutorRouter = express.Router();
tutorRouter.post('/register',tutorController.register);
tutorRouter.post('/otp',tutorController.otp);
tutorRouter.post('/login',tutorController.login);
tutorRouter.post('/refresh-token',tutorController.refreshToken)


tutorRouter.post('/forgotPassword',tutorController.forgotPassword)
tutorRouter.post('/google_login',tutorController.googleLogin)
tutorRouter.post('/resetPassword',tutorController.resetPassword)
tutorRouter.get('/get-presigned-url', tutorController.getPresignedUrlForUpload);
tutorRouter.get('/get-presigned-url-download',tutorController.getPresignedUrlForDownload);
tutorRouter.get('/courseList',isTutorBlocked,authenticateToken(['tutor']),tutorController.courseList);
tutorRouter.get('/payouts', isTutorBlocked,authenticateToken(['tutor']),tutorController.payouts)
tutorRouter.get('/getTotalCoursesCount/:tutorId',isTutorBlocked,authenticateToken(['tutor']),tutorController.getTotalCoursesCount)
tutorRouter.get('/getStudentsCount/:tutorId',isTutorBlocked,authenticateToken(['tutor']),tutorController.getTotalStudentsCount)
tutorRouter.post('/additionalInfo',tutorController.additionalInfo)
tutorRouter.post('/editProfile',isTutorBlocked,authenticateToken(['tutor']),tutorController.editProfile)
tutorRouter.get('/tutorPayoutsByMonth' ,isTutorBlocked, tutorController.payoutsByMonth);
tutorRouter.get('/getEnrollments' ,isTutorBlocked, tutorController.getEnrollments);
tutorRouter.patch("/changeCourseStatus/:courseId",isTutorBlocked, authenticateToken(['tutor']),tutorController.changeCourseStatus)


export {tutorRouter}
