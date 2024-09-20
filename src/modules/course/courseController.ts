import expres,{Request,Response} from 'express'

import courseRabbitMqClient from './rabbitMQ.ts/client';

export const courseController={
    AddCourse:async(req:Request,res:Response)=>{
        try{
            console.log("data form addcourse1",req.body);
            const data=req.body;
            const operation = 'AddCourse';
             const result:any= await courseRabbitMqClient.produce(
                data,operation
            );
            console.log('Produced from apigateway course controller');
            
                return res.json(result)
        }catch(error){
            console.log("error in addcourse",error);
            
        }
    },
    fetchAllCourse:async(req:Request,res:Response)=>{
        try{
            const operation='fetchAllCourse'
            console.log('reached fetched course');
            
            const result = await courseRabbitMqClient.produce({},operation)

            console.log('hyyy');
            
            return res.json(result)
        }catch(error){
            console.log("error in fetching all course",error);
            
        }
    },
    singleCourse:async(req:Request,res:Response)=>{
        try {
            const  {courseId}= req.params;
            const operation = 'singleCourse'
            console.log('couseidddd',courseId);
            const result  =  await courseRabbitMqClient.produce(courseId,operation)
            return res.json(result)
            
        } catch (error) {
            console.log("Error in showing singlecourse page",error);
            
        }
    }
    
}