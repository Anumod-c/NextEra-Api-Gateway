import jwt from 'jsonwebtoken';
import config from '../config';


interface adminPayload{
    id:string;
    email:string;
}


export const generateToken = (user:adminPayload)=>{
    const payload = {
        id:user.id,
        email:user.email
    }

    const options ={
        expiresIn:'1h'
    }

    return jwt.sign(payload,config.JWT_SECRET as string,options)
}