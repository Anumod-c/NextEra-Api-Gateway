import exress,{Request,Response} from 'express';
import tutorRabbitMqClient from './rabbitMQ.ts/client'
import { generateToken } from '../../jwt/jwtCreate';
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
                const token = generateToken({id:result.tutorData._id,email:result.tutorData.email})
                result.token = token;
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
                const token = generateToken({
                    id:result.tutor._id,
                    email:result.tutor.email
                })
                result.token=token;
            }
            return res.json(result)
        }catch(error){
            console.log('error in goofle login frm tutor controller',error)
        }
    }
}