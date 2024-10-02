import expres, { Request, Response } from "express";
import tutorRabbitMqClient from "../tutor/rabbitMQ.ts/client";
import courseRabbitMqClient from "./rabbitMQ/client";


export const courseController = {
    AddCourse: async (req: Request, res: Response) => {
        try {
            console.log("data form addcourse1", req.body);
            const data = req.body;
            const operation = "AddCourse";
            const result: any = await courseRabbitMqClient.produce(data, operation);
            console.log("Produced from apigateway course controller");

            return res.json(result);
        } catch (error) {
            console.log("error in addcourse", error);
        }
    },
    fetchAllCourse: async (req: Request, res: Response) => {
        try {
            const operation = "fetchAllCourse";
            console.log("reached fetched course");

            const result: any = await courseRabbitMqClient.produce({}, operation);
            console.log("result", result);
            console.log("hyyy");
            if (result.success && result.courses.length > 0) {
                const coursesWithTutors = await Promise.all(
                    result.courses.map(async (course: any) => {
                        const tutorDetails = await tutorRabbitMqClient.produce(
                            { tutorId: course.tutorId },
                            "fetchTutorById"
                        );

                        return {
                            ...course,
                            tutorDetails: tutorDetails ? tutorDetails : null,
                        };
                    })
                );
                return res.json({
                    success: true,
                    message: "Courses fetched successfully with tutor details",
                    courses: coursesWithTutors,
                });
            }
            return res.json({
                success: false,
                message: "No courses found",
            });
        } catch (error) {
            console.log("error in fetching all course", error);
        }
    },
    singleCourse: async (req: Request, res: Response) => {
        try {
            const { courseId } = req.params;
            const operation = "singleCourse";
            console.log("couseidddd", courseId);
            const result = await courseRabbitMqClient.produce(courseId, operation);
            console.log("resulteeee", result);

            return res.json(result);
        } catch (error) {
            console.log("Error in showing singlecourse page", error);
        }
    },
};
