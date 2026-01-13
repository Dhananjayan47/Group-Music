import React,{useContext, useState} from "react";
import {Link,useNavigate} from "react-router-dom"
import API from "../services/api";
import { MusicContext } from "../context/AuthContext";
import { Alert } from "react-bootstrap";
const SignUp = () => {
   const {notification,setNotification}= useContext(MusicContext);
    const [isSubmit,setIsSubmit]=useState(false);
    const [userDetails, setUserDetails] = useState({name:'',email:'',password:''});
    const navigate=useNavigate();
    const handleInputs=(e)=>{
        const {name,value} =e.target
        setUserDetails((prev)=>({...prev,[name]:value}))
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();

        if (!userDetails.name || !userDetails.email || !userDetails.password) {
            return setNotification({msg:"Fill the all the field before submit",show:true,variant:'danger'});
        }
        
        
        try {
            setIsSubmit(true);
         await API.post('/api/user/register',userDetails);
        
        setUserDetails({name:'',email:'',password:''})
        navigate('/login');
        } catch (error) {
            setIsSubmit(false);
            setNotification({msg:"Error occurs please try again later",show:true,variant:'danger'});
            console.error('error when sending data :',error.response?.data?.message||error.message);
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
                        height: "75vh",
                        borderRadius: "1rem",
                        zIndex: 10,
                    }}
                >
                    <div className="d-flex flex-column justify-content-center align-items-start h-100 px-3">
                        <h1 className="text-white">Sign Up</h1>
                        <form className="d-flex flex-column w-100" onSubmit={handleSubmit}>
                           <div className="form-group mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control text-capitalize"
                                name="name"
                                id="name"
                                value={userDetails.name}
                                onChange={handleInputs}
                                placeholder="Enter Your Name"
                            />
                            {/* <small className="form-text text-light opacity-75">* minimum 5 character</small> */}
                           </div>
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
                            disabled={isSubmit}
                            className="btn btn-primary mb-3"
                           >
                            {isSubmit?'Loading...':'Sign Up'}
                           </button>
                           
                        </form>
                        <p className="text-white text-center w-100">Already have account ? <span><Link to='/login' className="fw-bold text-primary-emphasis">Login</Link></span></p>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default SignUp;
