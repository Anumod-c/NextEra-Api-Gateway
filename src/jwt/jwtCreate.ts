import jwt from 'jsonwebtoken';
import config from '../config';


interface UserPayload{
    id:string;
    email:string;
}


export const generateToken = (user:UserPayload)=>{
    const payload = {
        id:user.id,
        email:user.email
    }
//Generate access token
   const accessToken= jwt.sign(payload,config.JWT_SECRET as string ,{expiresIn :'15m'});


   const refreshToken =jwt.sign(payload,config.JWT_REFRESH_SECRET as string ,{expiresIn : '7d'})

   return {accessToken,refreshToken}
}