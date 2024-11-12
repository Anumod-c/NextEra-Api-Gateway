import express, { Request, Response } from "express";
import userRabbitMqClient from "../user/rabbitMQ/client";
import ordeRabbitMqClient from "../orders/rabbitMQ/client";
import adminRabbitMqClient from "./rabbitMQ/client";
import { generateToken } from "../../jwt/jwtCreate";
import tutorRabbitMqClient from "../tutor/rabbitMQ.ts/client";
import courseRabbitMqClient from "../course/rabbitMQ/client";
export const adminController = {
    login: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            console.log(req.body, "Admin login");
            const operation = "admin_login";
            const result: any = await adminRabbitMqClient.produce(data, operation);
            if (result.success) {
                const token = generateToken({
                    id: result.adminData._id,
                    email: result.adminData.email,
                    role: "admin",
                });
                result.token = token;
            }
            console.log("result back from adminservice", result);
            return res.json(result);
        } catch (err) {
            console.log(err, "error happend in login");
        }
    },

    getUsers: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const operation = "get_users";
            const result: any = await userRabbitMqClient.produce({  page, limit }, operation);
            console.log("fetched user reached apigateway", result);
            return res.json(result);
        } catch (err) {
            console.log(err);
        }
    },
    getTutors: async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const operation = "get_Tutors";
            const result: any = await tutorRabbitMqClient.produce({  page, limit }, operation);
            console.log("fetched tutor reached apigateway", result);
            return res.json(result);
        } catch (err) {
            console.log(err);
        }
    },
    getStudentsCount: async (req: Request, res: Response) => {
        try {
            const operation = "get_student_count";
            const result = await userRabbitMqClient.produce({}, operation);
            console.log(" user count", result);
            return res.json(result);
        } catch (err) {
            console.log("error in getotalstudents", err);
        }
    },
    getInstructorsCount: async (req: Request, res: Response) => {
        try {
            const operation = "get_tutor_count";
            const result = await tutorRabbitMqClient.produce({}, operation);
            console.log("tutorcount", result);
            return res.json(result);
        } catch (err) {
            console.log("error in getotaltutor", err);
        }
    },
    getTotalCourses: async (req: Request, res: Response) => {
        try {
            const operation = "get_courses_count";
            const result = await courseRabbitMqClient.produce({}, operation);
            return res.json(result);
        } catch (err) {
            console.log("error in getotaltutor", err);
        }
    },
    changeStatus: async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId;
            const { status } = req.body;
            console.log("data from block unblock ", userId, status);
            const data = {
                userId,
                status,
            };
            const operation = "change_status";
            const result: any = await userRabbitMqClient.produce(data, operation);
            return res.json(result);
        } catch (error) {
            console.log(error);
        }
    },
    changeTutorStatus: async (req: Request, res: Response) => {
        try {
           
            const tutorId = req.params.tutorId;
            const { status } = req.body;
            console.log("data from block unblock ", tutorId, status);
            const data = {
                tutorId,
                status,
            };
            const operation = "changeTutorStatus";
            const result: any = await tutorRabbitMqClient.produce(data, operation);
            return res.json(result);
        } catch (error) {
            console.log('Error in changin status for tutor',error);
        }
    },
    changeTutorVerification:async(req:Request,res:Response)=>{
        try {
            const tutorId = req.params.tutorId;
            const {isVerified}= req.body;
            const data ={
                tutorId,
                isVerified,
            }
            const operation='changeVerificationStatus';
            const result = await  tutorRabbitMqClient.produce(data,operation);
            return res.json(result);
        } catch (error) {
            console.log('Error in changin verfication status for tutor',error);

        }
    },
    adminPayouts: async (req: Request, res: Response) => {
        try {
            const operation = "admin_payout";
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result: any = await ordeRabbitMqClient.produce({  page, limit }, operation);
            console.log("resultof admin payouts", result);
            const { adminPayouts, totalPages, currentPage } = result;            
            const payoutsWithTutors = await Promise.all(
                adminPayouts.map(async (payout: any) => {
                    const tutorOperation = "fetchTutorById";
                    const tutorResult = await tutorRabbitMqClient.produce(
                        payout.tutorId,
                        tutorOperation
                    );
                    return {
                        ...payout,
                        tutorDetails: tutorResult,
                    };
                })
            );
            console.log('payoutWithTutor',payoutsWithTutors)
            return res.json({ adminPayouts: payoutsWithTutors,totalPages,currentPage });
        } catch (error) {
            console.log("error in payoutcontroler", error);
        }
    },
    courseTable: async (req: Request, res: Response) => {
        try {
            const operation = "courseTable";
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Fetching the courses
            console.log('reached course table')
            const result: any = await courseRabbitMqClient.produce({  page, limit }, operation);
            const {courses,totalPages, currentPage} = result;
            console.log('resultttttttt', result)
            // Fetching tutor details for each course
            const coursesWithTutor = await Promise.all(courses.map(async (course: any) => {
                const getTutorOperation = 'fetchTutorById';
                // Fetching tutor details using the course's tutorId
                const tutorResult: any = await tutorRabbitMqClient.produce(course.tutorId, getTutorOperation);
                console.log('tutorresultweeeee', tutorResult)
                // Returning the course with tutor details
                return {
                    ...course,
                    tutorDetails: tutorResult.tutorDetails
                };
            }));
            // Returning all courses with their tutor details
            return res.json({ coursesWithTutor,totalPages,currentPage  });
        } catch (error) {
            console.log("Error in listing the course", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    payoutsByMonth:async(req:Request,res:Response)=>{
        try {
            const operation = 'AdminPayoutsByMonth'
            console.log('hy from  payouts by month')
            const result = await ordeRabbitMqClient.produce({},operation);
            console.log('result from payouts by month',result)
            return res.json(result)
        } catch (error) {
            console.log("Error in  fetching result for adminPayoutsForMonth",error)
        }
    },
    changeCourseStatus: async (req: Request, res: Response) => {
        try {
            const courseId = req.params.courseId;
            const { status } = req.body;
            console.log("data from list unlist ", courseId, status);
            const data = {
                courseId,
                status,
            };
            const operation = "change_course_status";
            const result: any = await courseRabbitMqClient.produce(data, operation);
            return res.json(result);
        } catch (error) {
            console.log(error);
        }
    },
};
