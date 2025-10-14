import jwt from 'jsonwebtoken';
import { Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export const generateToken = (userId: any, res: Response) => {
    const token = jwt.sign({userId: userId}, process.env.JWT_SECRET as string, {expiresIn: '1d'});

    res.cookie('jwt', token,{
        maxAge: 7*24*60*60*1000, // 7 day
        httpOnly: true,// accessible only by web server
        sameSite: 'strict', // CSRF
    });

    return token;
}