import { Request, Response, NextFunction } from "express";
import userRabbitMqClient from '../modules/user/rabbitMQ/client';
import tutorRabbitMqClient from '../modules/tutor/rabbitMQ.ts/client'
import { IUser } from "../interface/IUser";
import { ITutor } from "../interface/ITutor";

interface UserCheckResult {
    success: boolean;
    message: string;
    user?: IUser; // Optional user field if user is found
}

interface TutorCheckResult{
    success:boolean;
    message:string;
    tutor?:ITutor;
}

export const userIsBlocked = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.cookies.userId; // Assuming userId is set in the cookies
        const operation = 'checkUserBlocked';
        console.log('User ID from userIsBlocked middleware:', userId);
        
        // Await the RabbitMQ operation to get the result
        const result: UserCheckResult = await userRabbitMqClient.produce(userId, operation)as UserCheckResult;
        console.log('resultt of userblock',result)
        if (result && result.success && result.user && result.user.status === false) { // Assuming 'status' indicates whether the user is blocked
            console.log('User is blocked by admin');
            return res.status(403).json({ message: 'Access denied. User is blocked.' });
        }
        next()
    } catch (error) {
        console.error("isBlocked middleware error:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }

};
export const tutorIsBlocked = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const tutorId = req.cookies.tutorId
        console.log('helloooooooooos',tutorId)
        const operation = 'checkTutorBlocked';
        const result :TutorCheckResult = await tutorRabbitMqClient.produce(tutorId,operation) as TutorCheckResult;
        console.log('ress',result)
        if(result && result.success && result.tutor && result.tutor.status === false){
            console.log('trigfgg')
            return res.status(403).json({ message: 'Access denied. User is blocked.' });
        }else{

            next()
        }
    } catch (error) {
        console.error("isBlocked middleware error:", error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}