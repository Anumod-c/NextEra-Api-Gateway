import {Request,Response} from 'express';
import jwt  from 'jsonwebtoken';
import config from '../../config';
import tutorRabbitMqClient from './rabbitMQ.ts/client';
import courseRabbitMqClient from '../course/rabbitMQ/client';
 import ordeRabbitMqClient from '../orders/rabbitMQ/client'
import { generateToken } from '../../jwt/jwtCreate';
import { S3Client, GetObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3'

import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
});

export const tutorController={
    register :async(req:Request, res:Response)=>{
        try{
            console.log(req.body,'tutor registerd in apigateway');

            const data =req.body;
           const operation = 'register_tutor';
           const result:any = await  tutorRabbitMqClient.produce(data,operation);
           console.log('produced from apigateway', "otp", result.otp, "userData", result.userData);
            return res.json(result)
        }
        catch(err){
            console.log(err,'error happend in tutor register')
        }
    },

    otp: async (req: Request, res: Response) => {
        try {
            console.log('Reached otp in api gateway', req.body);

            const enteredOtp = req.body.otp;
            const forgotPass = req.body.forgotPass;
            let operation = 'tutor_register_otp';

            if (forgotPass) {
                operation = 'tutor_forgotpass_otp'; // Operation for forgot password
            }

            console.log('otp compared and are same');

            // Send request to the user service to create the user
            const result: any = await tutorRabbitMqClient.produce({ otp: enteredOtp }, operation);
            console.log('OTP sent from API Gateway to user service', result);

            if (result && result.success) {
                return res.json({
                    success: true,
                    forgotPass: forgotPass, // Return forgotPass status
                    message: forgotPass ? "OTP verified. Proceed to reset password." : "OTP verified. User registered successfully",
                    tutor:!forgotPass? result.tutor_data : ''
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: "User registration failed. Please try again."
                });
            }


        } catch (error) {
            console.error("ERROR IN OTP APIGATEWAY", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            });
        }
    },


    login:async(req : Request,res : Response)=>{
        try{
            let data= req.body;
            console.log('tutor logged in apigateway',data);
            const operation = 'tutor_login';
            const result :any = await  tutorRabbitMqClient.produce(data,operation);
            if(result.success){
                const token = generateToken({
                    id:result.tutorData._id,
                    email:result.tutorData.email,
                    role:'tutor'})
                result.token = token;
                console.log("cookieeeeee",req.cookies.tutorId)
                console.log('tokeeeeeeen',result,result.token)
            }
            return res.json(result)

           
        }catch(err){
            console.log(err,'error in tutor login')
        }
    },
    forgotPassword: async(req:Request,res:Response)=>{
        try{
            console.log(req.body,'email from forgotPasword');
            const data = req.body.email;
            const operation = 'tutor_forgot_pass';
            const result :any = await tutorRabbitMqClient.produce(data,operation);
            console.log(result,'result');
            return res.json(result)
             
            
        }catch(erro){
            console.log('error in tutorcontrollero for forgotpassword');
            
        }
    },

    resetPassword:async(req:Request,res:Response)=>{
        try{
            console.log('data reached insidethe tutor conntroller for reset password');
            const data = req.body;
            const operation =  'tutor_reset_pass';
            const result :any = await tutorRabbitMqClient.produce(data,operation);
            return res.json(result)    
        }catch(error){
            console.log('eroor in resetpassword for tutror controller',error)
        }
        
    },
    googleLogin : async (req:Request,res:Response)=>{
        try{
            const {credential} =req.body;
            const operation =  'tutor_google_login';
            const result:any=  await tutorRabbitMqClient.produce({credential},operation);
            if(result.success){
                res.cookie("tutorId",result.tutor._id)
               
                const token = generateToken({
                    id:result.tutor._id,
                    email:result.tutor.email,
                    role:'tutor',
                })
                result.token=token;
            }
            return res.json(result)
        }catch(error){
            console.log('error in goofle login frm tutor controller',error)
        }
    },


    getPresignedUrlForUpload: async (req: Request, res: Response) => {
        try {
            console.log('hyee')
            const { filename,fileType  } = req.query;
            console.log(filename,fileType,'filenamessss');
            if (typeof filename !== 'string' || typeof fileType !== 'string') {
                return res.status(400).json({ error: 'Filename and fileType query parameters are required and should be strings.' });
            }
              // Map fileType to content type if needed
              let contentType = 'application/octet-stream';
        if (fileType === 'image') {
            contentType = 'image/jpeg';
        } else if (fileType === 'video') {
            contentType = 'video/mp4'; // Adjust if necessary for different video types
        }  

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: filename,
                ContentType:contentType, // Set the content type of the uploaded file
            });
            console.log(command,'command');
            

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
            console.log('eeeeeeeeeeeeeeeeeeeeeeee',url,'urleeeeeeeeeeeeeeeee')
            return res.json({ url });
        } catch (error) {
            console.error('Error generating presigned URL', error);
            return res.json({ error: 'Could not generate presigned URL' });
        }
    },
    getPresignedUrlForDownload: async (req: Request, res: Response) => {
        try {
            const { filename } = req.query;

            if (typeof filename !== 'string') {
                return res.status(400).json({ error: 'Filename query parameter is required and should be a string.' });
            }

            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME!,
                Key: filename,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
            console.log('download url',url);
            
            return res.json({ url });
        } catch (error) {
            console.error('Error generating presigned URL for download', error);
            return res.status(500).json({ error: 'Could not generate presigned URL' });
        }
    },
    courseList:async(req:Request,res:Response)=>{
        try{
            console.log('reached courselisting',req.query);
            const tutorId = req.query.tutorId as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const operation = 'courseList';
            const result :any = await courseRabbitMqClient.produce({ tutorId, page, limit },operation);
            return res.json(result)
            
        }catch(error){
            console.log("error in courselisting in turorside");
            
        }
    },
    payouts:async(req:Request,res:Response)=>{
        try {
            const tutorId = req.query.tutorId as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            console.log('..............................................................',tutorId)
            const operation = 'tutor_payout'
            const result :any = await ordeRabbitMqClient.produce({ tutorId, page, limit },operation);
            return res.json(result);
        } catch (error) {
            console.log("error in payoutcontroler",error)
        }
    },
    getTotalCoursesCount:async(req:Request,res:Response)=>{
        try {
            console.log('helloooc')
            const tutorId = req.params.tutorId
            console.log('tutorId',tutorId);
            const operation = 'getTotalCoursesCount';
            const result = await courseRabbitMqClient.produce(tutorId,operation);
            return res.json(result);
        } catch (error) {
            console.log("Error in myTotalCoursesCount",error)
        }
    },
     getTotalStudentsCount:async(req:Request,res:Response)=>{
        try {
            const tutorId = req.params.tutorId;
            const operation = 'getTotalStudentsCount'
            const result = await courseRabbitMqClient.produce(tutorId,operation)
            console.log('gettotalstudentscount',result)
            return res.json(result)
        } catch (error) {
            console.log("Error in getTotalStudentsCount",error)
        }
    },
     additionalInfo:async(req:Request,res:Response)=>{
        try {
           
            console.log('hyadditionalInfo')
            console.log('additional data',req.body)
            const tutorData = req.body;
            const operation ='additonalInfo'
            const  result = await tutorRabbitMqClient.produce(tutorData,operation);
            console.log('resu;teeeeee',result)
            return res.json(result)
        } catch (error) {
            console.log("Error in  adding aditional info",error)
        }
    },
    editProfile:async(req:Request,res:Response)=>{
        try {
           console.log('editprofiledata',req.body) 
           const tutorData = req.body;
           const operation ='editProfile'

           const  result = await tutorRabbitMqClient.produce(tutorData,operation);
           return res.json(result)

        } catch (error) {
            console.log("Eror in edit parofile")
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
    payoutsByMonth:async(req:Request,res:Response)=>{
        try {
            console.log('reached payout by month of tutor')
            const tutorId = req.query.tutorId;
            console.log('tutorIdddddddddddddd',tutorId)
            const operation = 'TutorPayoutsByMonth'
            console.log('hy from  payouts by month from tutor')
            const result = await ordeRabbitMqClient.produce(tutorId,operation);
            console.log('result from payouts by month',result)
            return res.json(result)
        } catch (error) {
            console.log("Error in  fetching result for tutorPayoutsForMonth",error)
        }
    },
    getEnrollments:async(req:Request,res:Response)=>{
        try {
            console.log('reached getEnrollments')
            const tutorId = req.query.tutorId;
            console.log('tutorIdddddddddddddd',tutorId)
            const operation = 'getStudentEnrollments'
            console.log('hy from  getStudentEnrollments')
            const result = await courseRabbitMqClient.produce(tutorId,operation);
            console.log('result from getStudentEnrollments',result)
            return res.json(result)
        } catch (error) {
            console.log("Error in  fetching result for tutorPayoutsForMonth",error)
        }
    },
    refreshToken: async (req: Request, res: Response) => {
        console.log('tooookssssssssssssssssssssssssssssssssssssen tutor')

        const token = req.body.token?.replace(/"/g, ''); 
        console.log('tooooken',token)
        console.log('tooookensss',req.body.token)

    if (!token) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }

    jwt.verify(token, config.JWT_REFRESH_SECRET as string, (err: any, user: any) => {
        if (err) {
            console.log('verfication failed',err)
            return res.status(403).json({ message: "Refresh token is invalid or expired" });
        }

        const { id, email } = user;
        console.log("user role",user)
        const newAccessToken = jwt.sign({ id, email ,role:user.role}, config.JWT_SECRET as string, { expiresIn: '15m' });

     

        res.json({ accessToken: newAccessToken });
    });
},
}

