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
                        const tutorId= course.tutorId;
                        const tutorDetails = await tutorRabbitMqClient.produce(
                            tutorId,
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
            const courseResult: any = await courseRabbitMqClient.produce(courseId, operation);

            if (!courseResult.success) {
                return res.status(404).json({ message: "Course not found" });
            }
            console.log("resulteeee", courseResult);
            const course = courseResult.course;
            const tutorId = course.tutorId;

            // Fetch tutor details using tutorId
            const tutorOperation = "fetchTutorById";
            const tutorResult: any = await tutorRabbitMqClient.produce(tutorId, tutorOperation);


            if (!tutorResult.success) {
                return res.status(404).json({ message: "Tutor not found" });
            }
            console.log('datass',tutorResult)
            const tutor = tutorResult.tutorDetails;

            // Combine course and tutor data
            const result = {
                success: true,
                message: "Single Course and Tutor fetched successfully",
                course,
                tutor
            };
            return res.json(result);

        } catch (error) {
            console.log("Error in showing singlecourse page", error);
        }
    },
};
