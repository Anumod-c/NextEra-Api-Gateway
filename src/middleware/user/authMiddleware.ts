import { NextFunction,request,response } from "express";

import jwt, { decode } from "jsonwebtoken";

import config from "../../config";

const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    console.log('function triggered in auth middleware');
    const authHeader = req.headers['authorization'] as string | undefined;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        console.log('reaced inside the ifstatement of!token');
        return {success:false,message:'Access denied, Token not found'};
    }

    console.log('after token');

    jwt.verify(token,config.JWT_SECRET as string, (err:any,decode:any)=>{
        if(err){
            return {success:false, message:"Invalid Token"};
        }
        next()
    })
    
}

export default authenticateToken