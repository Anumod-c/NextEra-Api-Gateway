import express, { Request, Response } from "express";

import orderRabbitMqClient from "./rabbitMQ/client";
import userRabbitMqClient from "../user/rabbitMQ/client";
import courseRabbitMqClient from "../course/rabbitMQ/client";
import chatRabbitMqClient from "../chat/rabbitMQ/client";
import { IUser } from "../../interface/IUser";
export const orderController = {
    makePayment: async (req: Request, res: Response) => {
        try {
            const operation = "create_order";
            const data = req.body;
            console.log("data from bodyyyyyyyyyyy", data, operation);
            const result: any = await orderRabbitMqClient.produce(data, operation);
            console.log("coursedaaataaaaaaaa", result);
            return res.json(result);
        } catch (error) {
            console.log("Error in making payment");
        }
    },
    saveOrder: async (req: Request, res: Response) => {
        try {
            console.log("save orderrrrrrrrrrrrrrrrrrrrrrrrrr");
            const operation = "save_order";
            const CourseData = req.body;
            console.log("data from saveorder", CourseData);

            // Step 1: Save the order using RabbitMQ
            const result: any = await orderRabbitMqClient.produce(
                CourseData,
                operation
            );

            const { userId, courseId } = CourseData;

            // Step 2: Add the courseId to the user's record in User Service
            const userOperation = "add_courseId";
            const userCourseData = { userId, courseId }; // Prepare payload for User Service
            const userResult: any = await userRabbitMqClient.produce(
                userCourseData,
                userOperation
            );
            console.log("Course added to user, result:", userResult);

            // Step 3: Add the userId to the course's record in Course Service
            const courseOperation = "add_userId_to_course";
            const courseUpdateData = { courseId, userId };
            const courseResult: any = await courseRabbitMqClient.produce(
                courseUpdateData,
                courseOperation
            );
            console.log("User added to course, result:", courseResult);

            // Step 4: Creating a chat room if it doesn't exist, or adding the user if it does
            const chatOperation = "create_or_add_user_to_room";
            const chatData = { userId, courseId }; 
            const chatResult: any = await chatRabbitMqClient.produce(
                chatData,
                chatOperation
            );
            console.log("User added to chat room, result:", chatResult);

            return res.json({
                order: result,
                userUpdate: userResult,
                courseUpdate: courseResult,
                chatUpdate: chatResult, 
            });
        } catch (error) {
            console.log("Error in making payment");
        }
    },
};
