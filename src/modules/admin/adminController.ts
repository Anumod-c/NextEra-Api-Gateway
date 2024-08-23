import express,{Request,Response} from "express";

import adminRabbitMqClient from './rabbitMQ/client'
import { generateToken } from "../../jwt/jwtCreate";

export const adminController = {
    login :async(req:Request, res:Response)=>{
        try{
            const data = req.body;
            console.log(req.body,'Admin login');
            const operation = 'admin_login';
            const result :any = await adminRabbitMqClient.produce(data,operation);
            if(result.success){
                const token = generateToken({
                    id:result.adminData._id,
                    email:result.adminData.email
                })
                result.token =token;
            }
            console.log("result back from adminservice",result)
            return res.json(result)
        }
        catch(err){
            console.log(err,'error happend in login')
        }
    }
}