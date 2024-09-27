import express,{Request,Response} from 'express';

import orderRabbitMqClient from './rabbitMQ/client'
export const orderController={
    makePayment: async (req:Request,res:Response)=>{
        try {
            const operation = 'create_order';
            const data = req.body;
            console.log('data from bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',data,operation);
            const result:any= await orderRabbitMqClient.produce(data,operation);
            console.log('coursedaaataaaaaaaa',result)
            return res.json(result)


        } catch (error) {
            console.log("Error in making payment")
        }
    },
    saveOrder:async(req:Request,res:Response)=>{
        try {
            console.log('save orderrrrrrrrrrrrrrrrrrrrrrrrrr')
            const operation = 'save_order';
            const data = req.body;
            console.log('data from saveorder',data)
            const result:any= await orderRabbitMqClient.produce(data,operation);
            return res.json(result)
        } catch (error) {
            console.log("Error in making payment")
        }
    }
}