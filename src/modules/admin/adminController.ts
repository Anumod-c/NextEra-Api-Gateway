import express,{Request,Response} from "express";
import userRabbitMqClient from '../user/rabbitMQ/client'
import adminRabbitMqClient from './rabbitMQ/client'
import { generateToken } from "../../jwt/jwtCreate";
import tutorRabbitMqlient from '../tutor/rabbitMQ.ts/client'

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
    },

    getUsers:async(req:Request,res:Response)=>{
        try{
            const operation = 'get_users';
            const result:any = await  userRabbitMqClient.produce({},operation);
            console.log('fetched user reached apigateway',result)
            return res.json(result)
        }catch(err){
            console.log(err)
        }
    },
    getTutors:async(req:Request,res:Response)=>{
        try{
            const operation = 'get_Tutors';
            const result:any = await  tutorRabbitMqlient.produce({},operation);
            console.log('fetched tutor reached apigateway',result)
            return res.json(result)
        }catch(err){
            console.log(err)
        }
    },
    getStudentsCount:async(req:Request,res:Response)=>{
        try{
            const operation = 'get_student_count';

            const result = await userRabbitMqClient.produce({},operation);
            console.log(' user count',result)
            return res.json(result)
        }catch(err){
            console.log('error in getotalstudents',err)
        }
    },
    getInstructorsCount:async(req:Request,res:Response)=>{
        try{
            const operation = 'get_tutor_count';

            const result = await tutorRabbitMqlient.produce({},operation);
            console.log('tutorcount',result)
            return res.json(result)
        }catch(err){
            console.log('error in getotaltutor',err)
        }
    },
    changeStatus:async(req:Request,res:Response)=>{
        try{
            const userId= req.params.userId;
            const {status} = req.body;
            console.log('data from block unblock ', userId,status);
            const data ={
                userId,
                status,
            }
            const operation ='change_status';
            const result:any =await userRabbitMqClient.produce(data,operation) ;
            return res.json(result)
        }catch(error){
            console.log(error)
        }
    },
}