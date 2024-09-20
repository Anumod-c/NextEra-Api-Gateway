import express, { Request, Response } from "express";
import userRabbitMqClient from "./rabbitMQ/client";
import { generateToken } from "../../jwt/jwtCreate";
import jwt from "jsonwebtoken";
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
                });

                // res.cookie("accessToken", accessToken, {
                //     httpOnly: true,
                //     secure: true,
                //     maxAge: 15 * 60 * 1000,
                //     sameSite: "strict",
                // });

                // res.cookie("refreshToken", refreshToken, {
                //     httpOnly: true,
                //     secure: true,
                //     maxAge: 7 * 24 * 60 * 60 * 1000,
                //     sameSite: "strict",
                // });
                // console.log(req.cookies,'jkfkdjfkdjfkdjk');
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
                });
            return res.json({result,token:{accessToken,refreshToken}})
            }
        } catch (error) {
            console.log(error, "error in google login");
        }
    },
    
    
    
};
