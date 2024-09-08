import expres,{Request,Response} from 'express'

import courseRabbitMqClient from './rabbitMQ.ts/client';

export const courseController={
    AddCourse1:async(req:Request,res:Response)=>{
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
            console.log("error in addcourse1",error);
            
        }
    }
}