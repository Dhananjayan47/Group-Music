import React from "react";
import {Link} from "react-router-dom"
const ErrorPage = () => {
    return (
        <section className=" container-fluid bg-secondary vh-100 vw-100 d-flex justify-content-center align-items-center">
        <div className="text-white border border-secondary-subtle border-2 p-3 p-sm-5 text-center rounded rounded-3">
            <p className="h3">Unknown User 404 Error !!!</p>
            <p className="m-0"> User must enter the room filling the join room page 
               </p>
               <p className="m-0"> <Link to='/dashboard' className="btn btn-primary m-3">Home Page</Link>
                   
    <Link to='/join-room' className="btn btn-primary m-3">Join room</Link>
                 </p>
        </div>
    </section>
     );
}
 
export default ErrorPage;

