import { Router,Request,Response } from "express";
import { User } from "../db/user.db.js";

const router = Router();

router.post('/login',(req: Request, res: Response)=>{
    try{
         const {email,password} = req.body;
    //validation to add
    //check if password exists
    const passwordCheck = User.findOne({email});
    if(!passwordCheck){
        res.status(401).json({
            message:"Password is wrong"
        });
    }
    res.json({ 
            success: true,
            message: 'User logged in successfully',
            data: { email }
    });
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Login failed"
        })
    }
   
});

router.post('/signup',()=>{

});

export default router;