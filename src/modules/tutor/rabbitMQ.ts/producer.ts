import { Channel } from "amqplib";
import rabbitMqConfig from "../../../config/rabbitMqConfig";
import { randomUUID } from "crypto";
import {EventEmitter} from 'events';

export default class Producer{
    constructor(
        private channel: Channel,
      private replyQueueName: string,
      private eventEmitter: EventEmitter
   ) { }

   async produceMessage(data:any={}, operation:string){
        const uuid = randomUUID();
        this.channel.sendToQueue(
            rabbitMqConfig.rabbitMQ.queues.tutorQueue,Buffer.from(JSON.stringify(data)),
            {
                replyTo:this.replyQueueName,
                correlationId:uuid,
                headers:{function:operation},
            }
        );
        console.log('data send to tutorservice')

        return new Promise((resolve,reject)=>{
            this.eventEmitter.once(uuid,async(message)=>{
                try{
                    console.log('Line under the promise');
                    const reply = JSON.parse(message.content.toString());
                    resolve(reply)
                    
                }catch(err){
                    reject(err)
                }
            });
        });
    }
}