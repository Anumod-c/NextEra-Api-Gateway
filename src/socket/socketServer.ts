import  {Server, Socket } from 'socket.io';
import {Server as HttpServer} from 'http';



let io:Server;

export const initializeSocket = (server:HttpServer)=>{
    io = new Server(server,{
        cors:{
            origin:'http://localhost:5173',
            methods:['POST','GET'],
            credentials:true,
        },
    });
    //main connection
    io.on('connection',(socket)=>{
        console.log('user connected',socket.id);


        socket.on('sendMessage',(message)=>{
            console.log('recieved message',message)
        })


    })

    
}