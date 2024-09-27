import { Channel,connect,Connection } from "amqplib";

import rabbitMqConfig from "../../../config/rabbitMqConfig";

import Producer from "./producer";
import Consumer from "./consumer";
import {EventEmitter} from 'events';



class RabbitMQClient{
    private static instance : RabbitMQClient;
    private connection : Connection |undefined;
    private producerChannel : Channel | undefined;
    private consumerChannel : Channel | undefined;
    private producer : Producer | undefined;
    private consumer : Consumer |undefined;
    private eventEmitter : EventEmitter = new EventEmitter();
    private isInitialized = false

    private constructor(){}

    public static getInstance(){
        if(!this.instance){
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async inittialize(){
        if(this.isInitialized){
            return;
        }
        try{
            this.connection =  await connect(rabbitMqConfig.rabbitMQ.url);
            this.producerChannel =  await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            const {queue:replyQueueName} = await this.consumerChannel.assertQueue('',{exclusive:true});

            this.eventEmitter = new EventEmitter();
            
            this.producer =  new Producer(this.producerChannel,replyQueueName,this.eventEmitter);
            this.consumer =  new Consumer(this.consumerChannel,replyQueueName,this.eventEmitter);
            await this.consumer.consumeMessage();
            this.isInitialized = true;


        }catch(error:any){
            console.error(error,'Rabbitmq error in client.ts in initializing')
        }
    }

    async produce(data:any={},
        operations:string){
            if(!this.isInitialized){
                await this.inittialize();
            }
            return this.producer?.produceMessage(data,operations)
        }

}

export default RabbitMQClient.getInstance();