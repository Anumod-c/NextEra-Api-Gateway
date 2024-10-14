import config from './index';

interface RabbitMqConfig{
    rabbitMQ:{
        url:string,
        queues:{
            userQueue : string,
            adminQueue:string,
            tutorQueue:string,
            courseQueue:string;
            orderQueue:string;
            chatQueue:string;
        };
    };

} 

const  rabbitMqConfig: RabbitMqConfig ={
    rabbitMQ:{
        url : config.RABBITMQURL,      //rabbitMQ server url
        queues:{
            userQueue: 'user_queue' ,  // queue for user related operation
            adminQueue: 'admin_queue',
            tutorQueue: 'tutor_queue',
            orderQueue: 'order_queue',
            courseQueue:'course_queue',
            chatQueue:'chat_queue',
           
        },
    },
};

export default rabbitMqConfig