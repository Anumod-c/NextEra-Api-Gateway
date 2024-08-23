import { Channel } from "amqplib";
import rabbitMqConfig from "../../../config/rabbitMqConfig";

import { randomUUID } from "crypto";
import {EventEmitter} from 'events'

export default class Producer{
    constructor(
        private chanenel : Channel,
        private replyQueueName:string,
        private eventEmitter : EventEmitter
    ){}
    async produceMessage(data:any={},operation:string){
        const uuid = randomUUID();
        this.chanenel.sendToQueue(
            rabbitMqConfig.rabbitMQ.queues.adminQueue,Buffer.from(JSON.stringify(data)),{
                replyTo: this.replyQueueName,
                correlationId:uuid,
                headers:{function:operation},
            }
        );
        console.log('data send to admin service');

        return new Promise((resolve,reject)=>{
            this.eventEmitter.once(uuid,async(message)=>{
                try{
                    console.log('line inside the primise of admin gateway');
                    const reply = JSON.parse(message.content.toString());
                    resolve(reply)
                }catch(error){
                    reject(error)
                }
            });
        });
        
    }
}