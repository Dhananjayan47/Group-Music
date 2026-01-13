import User from '../modules/userModule.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendMail from '../utils/mailer.js';

const register=async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: "Email already registered" });
        
        const saltRound=Number(process.env.SALT);
        const hash =await bcrypt.hash(password,saltRound);

       
        const newUser=new User({
            name,
            email,
            password:hash
        });
    
        await newUser.save();

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>GROUP MUSIC</h2>
      <h4>Dear ${name},</h4>
      <p>Welcome to <strong>GROUP MUSIC</strong>! We’re excited to have you 🎵</p>
    </div>
  `;
  await sendMail(email, 'WELCOME TO GROUP MUSIC',emailHtml);
  res.status(201).json({success: true,message:'user registered successfully'})
    } catch (error) {
        console.error("Backend Error:", error?.response?.body || error);

        // send error back to frontend
        return res.status(500).json({
          success: false,
          error: error?.response?.body || error?.message || "Unknown error"
        });
    }
};

const login= async(req,res)=>{
    try {
      
        const {email,password}=req.body;
        
       
        const existUser= await User.findOne({email}).select('+password');
        
       
        if(!existUser){
            return res.status(404).json({success:false,message:'User Not Found'});
        }
     
        const isMatch= await bcrypt.compare(password,existUser.password);
        
      
        if(!isMatch){
            return res.status(400).json({success:false,message:'Password is incorrect'})
        }
     
        
        const otp =String(Math.floor(100000+Math.random()*900000));
        
        const saltRound=Number(process.env.SALT);
        const hashOtp = await bcrypt.hash(otp,saltRound);
        existUser.verifyOtp=hashOtp;
        existUser.verifyOtpExpireAt=Date.now()+5*60*1000;
        await existUser.save();
       
        await sendMail(existUser.email,'Your OTP from GROUP MUSIC',
            `<h5>Hii ${existUser.name}!!! </h5><p>Your One Time Password (OTP) is</p><h3>${otp}</h3><p>It will expires in 5 minutes .<br/> Thank you, <br/><strong>GROUP MUSIC</strong></p>`
        )
        
      

        res.status(200).json({success:true,message:'otp sent to your email'});

    } catch (error) {
        res.status(500).json({message:'server error',error:error.message});
    }
};

const createAccessToken=(userId)=>{
    return jwt.sign({userId},process.env.ACCESS_SECRET,{expiresIn:'1h'});
};
const createRefreshToken=(userId)=>{
    return jwt.sign({userId},process.env.REFRESH_SECRET,{expiresIn:'7d'});
};

const verifyOtp=async(req,res)=>{
    try {
        const {otp,email}=req.body;
        
        const existUser= await User.findOne({email});

        if(!existUser){
            return res.status(400).json({message:'invalid user'});
        };
        if(!existUser.verifyOtp){
            return res.status(400).json({message:'OTP not found or already used'});
        };

        if(existUser.verifyOtpExpireAt<Date.now()){
            return res.status(400).json({message:'OTP Expired'});
        };

        const isValid= await bcrypt.compare(otp,existUser.verifyOtp);
        if(!isValid){
            return res.status(400).json({message:'OTP incorrect'});
        };

        existUser.verifyOtp='';
        existUser.verifyOtpExpireAt=0;
        existUser.isAccountVerified=true;
        await existUser.save();
        
        const accessToken=createAccessToken(existUser._id);
        const refreshToken=createRefreshToken(existUser._id);

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.PROJECT_STATUS==='production',
            sameSite:process.env.PROJECT_STATUS==='production'?'None':'Lax',
            maxAge:7*24*60*60*1000,
            path:'/'
        })

        res.status(200).json({success:true,message:'OTP Verified & logged in',token:accessToken,user:existUser});

    } catch (error) {
        res.status(500).json({error:'server error when otp check',message:error.message});
    };
};

const refresh=async(req,res)=>{
   
    const token=req.cookies.refreshToken;

    if(!token){
        return res.status(401).json({message:'No Refresh Token'});
    };

    try {
        const decoded=jwt.verify(token,process.env.REFRESH_SECRET);

        const userDetail= await User.findById(decoded.userId);

        if(!userDetail){
            return res.status(404).json({message:'User not Found'});

        };

        const newAccessToken=createAccessToken(userDetail._id);

        return res.json({accessToken:newAccessToken});
    } catch (error) {
        return res.status(401).json({message:'Invalid Refresh Token',error:error.message});
    };
};

const resendOtp=async(req,res)=>{
    try {
        const {email}=req.body;
        const existUser= await User.findOne({email});
        
       
        if(!existUser){
            return res.status(404).json({message:'User Not Found'});
        }

        const otp =String(Math.floor(100000+Math.random()*900000));
        
        const saltRound=Number(process.env.SALT);
        const hashOtp = await bcrypt.hash(otp,saltRound);
        existUser.verifyOtp=hashOtp;
        existUser.verifyOtpExpireAt=Date.now()+5*60*1000;
        await existUser.save();
       
        await sendMail(email,'Your OTP from GROUP MUSIC',
            `<p>Your One Time Password (OTP) is</p><h3>${otp}</h3><p>It will expires in 5 minutes .<br/> Thank you, <br/><strong>GROUP MUSIC</strong></p>`
        )
        res.json({success:true,message:'otp resent'})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const logout= async(req,res)=>{

    try {
        res.clearCookie('refreshToken',{
            httpOnly: true,
            secure: process.env.PROJECT_STATUS === 'production',
            sameSite: process.env.PROJECT_STATUS === 'production' ? 'None' : 'Lax',
            path: '/'
        }); 
        res.status(200).json({success:true,message:'You are successfully Logged-out'});        
    } catch (error) {
        res.status(500).json({message:error.message});
    };
};

export {register,login,verifyOtp,refresh,logout,resendOtp}