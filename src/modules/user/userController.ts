import express, { Request, Response } from "express";
import userRabbitMqClient from './rabbitMQ/client';
import { generateToken } from "../../jwt/jwtCreate";

export const userController = {
    register: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'register_user';
            console.log(req.body, 'user registerd in apigateway');
            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log('produced from apigateway', "otp", result.otp, "userData", result.userData);
            return res.json(result)

        }
        catch (err) {
            console.log(err, 'error happend in register')
        }
    },
    otp: async (req: Request, res: Response) => {
        try {
            console.log('Reached otp in api gateway', req.body);

            const enteredOtp = req.body.otp;
            const forgotPass = req.body.forgotPass;
            let operation = 'register_otp';

            if (forgotPass) {
                operation = 'forgot_pass_otp'; // Operation for forgot password
            }

            console.log('otp compared and are same');

            // Send request to the user service to create the user
            const result: any = await userRabbitMqClient.produce({ otp: enteredOtp }, operation);
            console.log('OTP sent from API Gateway to user service', result);

            if (result && result.success) {
                return res.json({
                    success: true,
                    forgotPass: forgotPass, // Return forgotPass status
                    message: forgotPass ? "OTP verified. Proceed to reset password." : "OTP verified. User registered successfully",
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
    }
    ,
    login: async(req: Request, res: Response) => {
        try {
            console.log(req.body, 'user logged in apigateway')
            const operation = 'user_login';
            const data = req.body;
            console.log('from req.body',req.body)
            const result:any = await userRabbitMqClient.produce(data,operation)

            console.log('resultt from usercontroller cam from userserivce',result);

            if(result.success){
                const token = generateToken({id:result.userData._id,email:result.userData.email})
                result.token = token;
            }
            
            
            return res.json(result)
        }
        catch (err) {
            console.log(err, 'error in user login')
        }
    },

    forgotPassword: async(req:Request,res:Response)=>{
        try{
            console.log(req.body,'email from forgot  password')
            const data = req.body.email
            const operation= 'user_forgot_pass';
            const result :any = await userRabbitMqClient.produce(data,operation)
            console.log(result,'result');
            
            return res.json(result)
        }catch(error){
            console.log("error in forgotpass in usercontroller",error)
        }
    },
    resetPassword :async(req:Request,res:Response)=>{

        try{
            console.log(req.body,'data reached inside the resetPassword');
            const data = req.body
            const operation = 'user_reset_pass';
            const result :any = await userRabbitMqClient.produce(data,operation)
           return res.json(result)
        }catch(error){
            console.log('error in resetPassword in userController',error)
        }
    },
    googleLogin : async(req:Request,res:Response)=>{
        try{
            console.log('dddddddddddddddddddddd',req.body);
            
            const {credential} = req.body;
            const operation = 'google_login';
            const result:any = await userRabbitMqClient.produce({credential},operation);
            console.log('resuylteeee',result);
            if(result.success){
                const token = generateToken({
                    id:result.user._id,email:result.user.email
                });
                result.token=token;
            }
            
            return res.json(result)
        }catch(error){
            console.log(error,'error in google login')
        }
    }
}