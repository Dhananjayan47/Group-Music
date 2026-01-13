import React, { useEffect} from "react";
import { useState,useContext } from "react";
import { FiInfo } from "react-icons/fi";
import {Link,useNavigate, useLocation} from "react-router-dom";
import { FaRegQuestionCircle } from "react-icons/fa";
// import { AuthContext } from "../context/AuthProvider";
import MyModal from "../components/Modal";
import CountDown from "react-countdown"
import {AuthContext, MusicContext} from "../context/AuthContext";
import API from "../services/api";
import { Alert } from "react-bootstrap";

const Login = () => {
    const {notification,setNotification}= useContext(MusicContext);
    const [userDetails, setUserDetails] = useState({email:'',password:''});
    const [isLoading, setIsLoading] = useState(false);
    const navigate= useNavigate();
    const location=useLocation();
const exitMsg=location.state
useEffect(()=>{
    if(!exitMsg) return;
    setNotification({ show: true,
        msg: exitMsg,
        variant: "warning",})
},[exitMsg]);

    const handleInputs=(e)=>{
        const {name,value}=e.target;
        setUserDetails((prev)=>({...prev,[name]:value}));
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
       
        if(!userDetails.email || !userDetails.password){
            return setNotification({msg:"Fill the all the field before submit",show:true,variant:'danger'});
        }
        try {
            setIsLoading(true);
            const response = await API.post('api/user/login',userDetails);
            if(response.data.success){
                setUserDetails({email:'',password:''})
                localStorage.setItem('loginEmail',userDetails.email);
                navigate('/verify');

            }else{
           setIsLoading(false);
            setNotification({msg:`${response.data.message}` ,show:true,variant:'danger'});
            }
        } catch (error) {
            setIsLoading(false);
            setNotification({msg: `${error.response?.data.message}`,show:true,variant:'danger'});
            console.error('error :',error.response?.data||error.message);
        }
    }
    return (
        <section className="container-fluid position-relative  d-flex flex-column align-items-center justify-content-center bg-info w-100 vh-100 overflow-hidden">
            {notification.show && (
                   <Alert
                       className=" fixed-top "
                       style={{ zIndex: 1000 }}
                       variant={notification.variant}
                       onClose={() =>
                           setNotification(() => ({
                               show: false,
                               msg: "welcome",
                               variant: "light",
                           }))
                       }
                       dismissible
                   >
                       {notification.msg}
                   </Alert>
               )}
            <div
                className="bg-warning position-fixed top-0 start-0  w-100"
                style={{
                    height: "50vh",
                    borderBottomLeftRadius: "2rem",
                    borderBottomRightRadius: "2rem",
                }}
            ></div>
            <div className="position-relative d-flex justify-content-center align-items-center col-lg-4 col-md-6 col-sm-8 vh-100">
                <section
                    className="bg-success position-relative p-3"
                    style={{
                        width: "100%",
                        height: "60vh",
                        borderRadius: "1rem",
                        zIndex: 10,
                    }}
                >
                    <div className="d-flex flex-column justify-content-center align-items-start h-100 px-3">
                        <h1 className="text-white">Login</h1>
                        <form className="d-flex flex-column w-100" onSubmit={handleSubmit}>
                           
                           <div className="form-group mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                id="email"
                                value={userDetails.email}
                                onChange={handleInputs}
                                placeholder="Enter Email"
                            />
                           </div>
                           <div className="form-group mb-4">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                id="password"
                                value={userDetails.password}
                                onChange={handleInputs}
                                placeholder="Enter Password"
                            />
                           </div>
                           <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary mb-3"
                           >
                            {isLoading ? 'Submitting...' : 'Login'}
                           </button>
                           
                        </form>
                        <p className="text-white">Don't have account ? <span><Link to='/sign-up' className="fw-bold text-primary-emphasis">Sign Up</Link></span></p>
                    </div>
                </section>
            </div>
        </section>
    );
};

const VerifyPage = () => {
    const [otp, setOtp] = useState('');
    const [isSubmit,setIsSubmit]=useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isBtnDisable, setIsBtnDisable] = useState(true);
    const {notification,setNotification}= useContext(MusicContext);
    // const countDownTime=useRef(Date.now()+60000)
    const {setAccessToken,setUser} = useContext(AuthContext);
    const navigate=useNavigate();
    const [expiry, setExpiry] = useState(null);

useEffect(() => {
    if(!isBtnDisable) return;
  setExpiry(Date.now() + 60000);
}, [isBtnDisable]);

    const renderer=({minutes,seconds,completed})=>{
        if(completed){
            return setIsBtnDisable(false);
        }else{
            return <span>{String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}</span>
        }
    }
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            if(!otp) return setNotification({msg:"Fill the OTP field before submit",show:true,variant:'danger'});
            setIsSubmit(true);
            const email = localStorage.getItem('loginEmail');
          const response = await API.post('api/user/verify',{email,otp});
          if(response.data.success){
              setAccessToken(response.data.token);
              
              setUser(response.data.user);
              API.defaults.headers.common["Authorization"]=`Bearer ${response.data.token}`;
              console.log(response.data.success);
              setOtp('')  ;
              localStorage.clear();
            //   setUserName(response.data.user.name);
              navigate('/dashboard');
          }
        //   Alert('error occurs');
        } catch (error) {
            setIsSubmit(false);
            setNotification({msg:"ERROR occurs please try again later",show:true,variant:'danger'});
        
            console.error('OTP error :',error.response?.data||error.message);
        }

    }

    const handleResend=async()=>{
        try {
            setIsBtnDisable(true);
            const email = localStorage.getItem('loginEmail');
            const {data}=await API.post('api/user/resendOtp',{email});
            if(data.success){
                setNotification({msg:'Your OTP sended',show:true,variant:'danger'});
            }
        } catch  {
            setNotification({msg:'error occurs please try again later',show:true,variant:'danger'});
        }
    }

    return (
        <section className="container-fluid position-relative  d-flex flex-column align-items-center justify-content-center bg-info w-100 vh-100 overflow-hidden">
          {notification.show && (
                   <Alert
                       className=" fixed-top "
                       style={{ zIndex: 1000 }}
                       variant={notification.variant}
                       onClose={() =>
                           setNotification(() => ({
                               show: false,
                               msg: "welcome",
                               variant: "light",
                           }))
                       }
                       dismissible
                   >
                       {notification.msg}
                   </Alert>
               )}
            <div
                className="bg-warning position-fixed top-0 start-0  w-100"
                style={{
                    height: "50vh",
                    borderBottomLeftRadius: "2rem",
                    borderBottomRightRadius: "2rem",
                }}
            ></div>
            <div className="position-relative d-flex justify-content-center align-items-center col-lg-4 col-md-6 col-sm-8 vh-100">
                <section
                    className="bg-success position-relative p-3"
                    style={{
                        width: "100%",
                        height: "45vh",
                        borderRadius: "1rem",
                        zIndex: 10,
                    }}
                >
                    <MyModal show={showModal} onHide={()=>setShowModal(false)} title="Information" content={ <>
      If you do not get the OTP in your inbox, please check the{" "}
      <strong>Spam folder</strong>.
    </>} confirmText="?"/>
                    <div className="d-flex flex-column justify-content-center align-items-start h-100 px-3">
                       <div className="w-100 text-light  d-flex justify-content-between align-items-center">
                        <h1>Verification</h1>
                        <FaRegQuestionCircle  size={20} onClick={()=>setShowModal(true)}/>
                       </div>
                        <form className="d-flex flex-column w-100" onSubmit={handleSubmit}>
                           <div className="form-group mb-4">
                            <label htmlFor="verify" className="form-label">OTP</label>
                            <input
                                type="password"
                                className="form-control"
                                name="verify"
                                id="verify"
                                value={otp}
                                onChange={(e)=>setOtp(e.target.value)}
                                placeholder="Enter Valid OTP"
                            />
                           </div>
                           <div className="btn-group" role="group" aria-label="Basic example">
                             
                           <button disabled={isBtnDisable} onClick={handleResend}
                            className="btn btn-secondary mb-3 me-3"
                           >
                            Resend
                           </button>
                           <button
                            type="submit"
                            disabled={isSubmit}
                            className="btn btn-primary mb-3"
                           >
                           {isSubmit?'Loading...':'Verify'}
                           </button>
                           </div>
                           
                        </form>
                        <p className="text-white-50 ">* After 1 min resend {(expiry && isBtnDisable)?<CountDown  date={expiry} renderer={renderer}/>:''}</p>
                        <p className="text-white">Wrong account ? <span><Link to='/login' className="fw-bold text-primary-emphasis">Login</Link></span></p>
                    </div>
                </section>
            </div>
        </section>
    );
}
 



export {VerifyPage,Login};
