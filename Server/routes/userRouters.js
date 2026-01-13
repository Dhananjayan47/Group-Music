import {resendOtp,register,login,logout,verifyOtp,refresh} from '../controllers/userControllers.js'
import {Router} from 'express'

const router=Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/verify',verifyOtp);
router.get('/refresh',refresh);
router.post('/resendOtp',resendOtp);


export default router;