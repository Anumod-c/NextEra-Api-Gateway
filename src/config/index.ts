import dotenv from 'dotenv';
dotenv.config()

const config ={
PORT : process.env.PORT,
USERPORT:process.env.USER_SERVICE_URL,
ADMINPORT:process.env.ADMIN_SERVICE_URL,
TUTORPORT:process.env.TUTOR_SERVICE_URL,
RABBITMQURL: process.env.RABBITMQ_URL || '',
JWT_SECRET: process.env.JWT_SECRET ||'nextera@123'

}

if(!config.RABBITMQURL){
    console.error('Rabbit MQ  is not defined in develpoment variables');
    process.exit(1)
}

export default config