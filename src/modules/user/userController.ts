import express, { Request, Response } from "express";
import userRabbitMqClient from "./rabbitMQ/client";
import courseRabbtiMqClient from '../course/rabbitMQ/client'
import { generateToken } from "../../jwt/jwtCreate";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
});



export const userController = {
    register: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = "register_user";
            console.log(req.body, "user registerd in apigateway");
            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(
                "produced from apigateway",
                "otp",
                result.otp,
                "userData",
                result.userData
            );
            return res.json(result);
        } catch (err) {
            console.log(err, "error happend in register");
        }
    },
    otp: async (req: Request, res: Response) => {
        try {
            console.log("Reached otp in api gateway", req.body);

            const enteredOtp = req.body.otp;
            const forgotPass = req.body.forgotPass;
            let operation = "register_otp";

            if (forgotPass) {
                operation = "forgot_pass_otp"; // Operation for forgot password
            }

            console.log("otp compared and are same");

            // Send request to the user service to create the user
            const result: any = await userRabbitMqClient.produce(
                { otp: enteredOtp },
                operation
            );
            console.log("OTP sent from API Gateway to user service", result);

            if (result && result.success) {
                return res.json({
                    success: true,
                    forgotPass: forgotPass, // Return forgotPass status
                    message: forgotPass
                        ? "OTP verified. Proceed to reset password."
                        : "OTP verified. User registered successfully",
                });
            } else {
                return res.json({
                    success: false,
                    message: result.message || "OTP verification failed. Please try again."
                });
            }
        } catch (error) {
            console.error("ERROR IN OTP APIGATEWAY", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
            });
        }
    },
    resendOtp:async(req:Request,res:Response)=>{
        try{
            const {email,forgotPass} = req.body;
            const operation = forgotPass? 'forgot_pass_resend_otp' : 'register_resend_otp';
            const result:any = await userRabbitMqClient.produce({email},operation);
            if(result.success){
                return res.json({
                    success:true,
                    message:"OTP resent successfully"
                })
            }
        }catch(error){
            return res.status(500).json({
                success:false,
                message:'Failed to resend OTP. Please try again',
            })
        }
    },
    login: async (req: Request, res: Response) => {
        try {
            console.log(req.body, "user logged in apigateway");
            const operation = "user_login";
            const data = req.body;
            console.log("from req.body", req.body);
            const result: any = await userRabbitMqClient.produce(data, operation);

            console.log("resultt from usercontroller cam from userserivce", result);

            if (result.success) {
                const { accessToken, refreshToken } = generateToken({
                    id: result.userData._id,
                    email: result.userData.email,
                    role:'user',
                });

                res.cookie('userId', result.userData._id)
                console.log("cookieeeeees",req.cookies.userId)
                return res.json({result,token:{accessToken,refreshToken}})
            }

            return res.json(result);
        } catch (err) {
            console.log(err, "error in user login");
        }
    },

    refreshToken: async (req: Request, res: Response) => {
        const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "Refresh token is missing" });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ message: "Refresh token is invalid or expired" });
        }

        const { id, email } = user;
        const newAccessToken = jwt.sign({ id, email }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,  // Cookie is not accessible via JavaScript
            secure: false,   // Allow cookie to be sent over HTTP
            // secure: true,  Cookie is sent only over HTTPS
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: "strict" // Prevents cross-site request forgery (CSRF)
        });

        res.json({ accessToken: newAccessToken });
    });
},
    forgotPassword: async (req: Request, res: Response) => {
        try {
            console.log(req.body, "email from forgot  password");
            const data = req.body.email;
            const operation = "user_forgot_pass";
            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, "result");

            return res.json(result);
        } catch (error) {
            console.log("error in forgotpass in usercontroller", error);
        }
    },
   
    resetPassword: async (req: Request, res: Response) => {
        try {
            console.log(req.body, "data reached inside the resetPassword");
            const data = req.body;
            const operation = "user_reset_pass";
            const result: any = await userRabbitMqClient.produce(data, operation);
            return res.json(result);
        } catch (error) {
            console.log("error in resetPassword in userController", error);
        }
    },
    googleLogin: async (req: Request, res: Response) => {
        try {
            console.log("dddddddddddddddddddddd", req.body);

            const { credential } = req.body;
            const operation = "google_login";
            const result: any = await userRabbitMqClient.produce(
                { credential },
                operation
            );
            console.log("resuylteeee", result);
            if (result.success) {
                const { accessToken, refreshToken } = generateToken({
                    id: result.user._id,
                    email: result.user.email,
                    role:'user',
                });
                res.cookie('userId', result.user._id)

            return res.json({result,token:{accessToken,refreshToken}})
            }
            return res.json(result)
        } catch (error) {
            console.log(error, "error in google login");
        }
    },
    editProfile:async(req:Request,res:Response)=>{
        try {
            const operation = 'editProfile';
            const data  = req.body;
            const result:any = await  userRabbitMqClient.produce(data,operation) ;
            return res.json(result)
        } catch (error) {
            console.log("error in editing profile")
        }
    },
    getPresignedUrlForUpload:async(req:Request,res:Response)=>{
        try {
            const { fileName,fileType  } = req.query;
            console.log(fileName,fileType,'filename');
            if (typeof fileName !== 'string' || typeof fileType !== 'string') {
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
            Key: fileName,
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
    updateProfilePicture:async(req:Request,res:Response)=>{
        try {
            console.log(req.body,'hyyyyyyyyyyy');
            const data = req.body;
            const operation= 'updateProfilePicture'
            const result:any= await userRabbitMqClient.produce(data,operation) ;
            return res.json(result)
        } catch (error) {
            console.error('Error  updating the profile picture', error);
            return res.json({ error: 'Could not update profile picture' })
        }
    },
    addReviews:async(req:Request,res:Response)=>{
        try {
            const data = req.body;
            const userId = data.userId;
            const operation = 'add_review_rating'
            console.log('data from review and rating',data)
            const reviewResult = await courseRabbtiMqClient.produce(data,operation);
            const userOperation ='getUserDetails';
            const userResult = await userRabbitMqClient.produce(userId,userOperation);
            const result= {reviewResult,userResult};
            console.log('result of addrevierw with user details',result)
            return res.json({result,success:true})

        } catch (error) {
            console.error('Error  submititng your review', error);
            return res.json({ error: 'Error  submititng your review' })

        }
    },
    fetchReviews:async (req:Request,res:Response)=>{
        try {
            const courseId= req.params.courseId;
            const operation ='fetch_review';
            const reviewResult :any= await courseRabbtiMqClient.produce(courseId,operation);
            const reivewWithUser = await Promise.all(
                reviewResult.newReview.map(async(review:any)=>{
                    const userId = review.userId;
                    const userDetails = await userRabbitMqClient.produce(
                        userId,'getUserDetails'
                    );
                    return {
                        ...review,userDetails:userDetails?userDetails: null
                    }
                })
                

            )
            return res.json({
                success:true,message:"Review fetched sucessfully",
                newReview:reivewWithUser
            })
           
           
        } catch (error) {
            console.error('Error  fetching review', error);
            return res.json({ error: 'Error  fethiching  review' })

        }
    }
   
    
    
};
