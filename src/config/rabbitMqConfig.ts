import config from './index';

interface RabbitMqConfig{
    rabbitMQ:{
        url:string,
        queues:{
            userQueue : string,
            adminQueue:string,
            tutorQueue:string,
        };
    };

} 

const  rabbitMqConfig: RabbitMqConfig ={
    rabbitMQ:{
        url : config.RABBITMQURL,      //rabbitMQ server url
        queues:{
            userQueue: 'user_queue' ,  // queue for user related operation
            adminQueue: 'admin_queue',
            tutorQueue: 'tutor_queue'
        },
    },
};

export default rabbitMqConfig