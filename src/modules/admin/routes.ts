import express from "express";
import { adminController } from "./adminController";
import authenticateToken from "../../middleware/authMiddleware";

const adminRouter = express.Router();

adminRouter.post("/login", adminController.login);
adminRouter.post('/refresh-token',adminController.refreshToken)


adminRouter.get("/getUsers", authenticateToken(['admin']), adminController.getUsers);
adminRouter.get("/getTutors", authenticateToken(['admin']), adminController.getTutors);
adminRouter.get("/getStudentsCount",  authenticateToken(['admin']),adminController.getStudentsCount);
adminRouter.get("/getInstructorsCount",  authenticateToken(['admin']),adminController.getInstructorsCount);
adminRouter.get("/getTotalCourses",  authenticateToken(['admin']),adminController.getTotalCourses);
adminRouter.patch("/changeStatus/:userId",  authenticateToken(['admin']),adminController.changeStatus),
adminRouter.patch("/changeTutorStatus/:tutorId",  authenticateToken(['admin']),adminController.changeTutorStatus),
adminRouter.patch("/changeTutorVerification/:tutorId",  authenticateToken(['admin']),adminController.changeTutorVerification),

adminRouter.get('/payouts', authenticateToken(['admin']), adminController.adminPayouts)
adminRouter.get('/courseTable', authenticateToken(['admin']), adminController.courseTable)
adminRouter.get('/payoutsByMonth' , authenticateToken(['admin']), adminController.payoutsByMonth);

adminRouter.patch("/changeCourseStatus/:courseId",  authenticateToken(['admin']),adminController.changeCourseStatus)

export { adminRouter };
