import express from "express";
import { adminController } from "./adminController";

const adminRouter = express.Router();

adminRouter.post("/login", adminController.login);
adminRouter.get("/getUsers", adminController.getUsers);
adminRouter.get("/getTutors", adminController.getTutors);
adminRouter.get("/getStudentsCount", adminController.getStudentsCount);
adminRouter.get("/getInstructorsCount", adminController.getInstructorsCount);
adminRouter.patch("/changeStatus/:userId", adminController.changeStatus);

export { adminRouter };
