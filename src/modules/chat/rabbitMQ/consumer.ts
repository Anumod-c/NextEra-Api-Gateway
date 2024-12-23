import { Channel,ConsumeMessage } from "amqplib";

import {EventEmitter} from 'events';

export default class Consumer{
    constructor(private channel :Channel,private replyQueuename:string,private eventEmitter:EventEmitter){}

    async consumeMessage(){
        this.channel.consume(this.replyQueuename,(message:ConsumeMessage | null)=>{
            if(message){
                this.eventEmitter.emit(message.properties.correlationId.toString(),message);
            }
        },{noAck:true})
    }
}
