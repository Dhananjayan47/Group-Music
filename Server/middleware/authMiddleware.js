
import jwt from 'jsonwebtoken';
import User from "../modules/userModule.js";

const protect=async(req,res,next)=>{
    const authHeader= req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized, no token" });
      }
    
    const token= authHeader.split(" ")[1]

    // if(!token){
    //     return res.status(401).json({message:'Not authorized'})
    // }
    try{
        const decode=jwt.verify(token,process.env.ACCESS_SECRET);
        const user=await User.findById(decode.userId).select('-password');
        if(!user){
          return  res.status(404).json({message:`user not ${decode.userId}`,});
        }
        req.user=user;
        next();
    }catch(err){
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
         }
         console.error("Auth middleware error:", err);
        res.status(401).json({message:'Not authorized , token failed'})
    }
}
export default protect;