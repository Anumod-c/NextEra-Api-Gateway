import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import chatRabbitMqClient from '../modules/chat/rabbitMQ/client';
interface ChatMessage {
    userId: string;
    text: string;
    courseId?: string;  // If needed for tracking
  }
  
// Global io variable to access the socket instance
let io: Server;

// Function to initialize the socket connection
export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173', // Adjust if needed
            methods: ['POST', 'GET'],
            credentials: true,
        },
    });

    // Main connection logic
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        //joining a room for a particular course
        socket.on('joinRoom', async(courseId) => {
            console.log(`User ${socket.id} joined room ${courseId}`);
            socket.join(courseId);

            //fetch existing messages for  the course from database
            const previousMessage = await chatRabbitMqClient.produce(courseId,'loadPreviousMessages');
            console.log('bla blb bla bla ',previousMessage)
            socket.emit('loadPreviousMessages',previousMessage)
        });

        socket.on('leaveRoom', (courseId) => {
            console.log(`User ${socket.id} left room ${courseId}`);
            socket.leave(courseId);
        });

        // Listener for 'sendMessage' event from client
        socket.on('sendMessage', async({ courseId, message }: { courseId: string, message: ChatMessage & { id: string } }) => {
            console.log(message,courseId);
            const saveMessage = await  chatRabbitMqClient.produce(message,'save-message');
            console.log('message saving is',saveMessage)
            // Emit the message to the correct course room
            io.to(courseId).emit('receiveMessage', { courseId, ...message });
        });

        
          

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};
