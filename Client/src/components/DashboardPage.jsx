import React,{useState,useContext, useEffect} from 'react';
import { AuthContext } from '../context/AuthContext';
import { MusicContext } from '../context/AuthContext';
import {useNavigate,useLocation} from 'react-router-dom';
import { Offcanvas,Accordion,Alert } from 'react-bootstrap';
import { FiMenu } from "react-icons/fi";
import MyModal from './Modal';
import {ProfileCircle,InfoCircle,LogOut} from "iconoir-react"
const DashboardPage = () => {


const [showModal, setShowModal] = useState(false);
 const {notification,setNotification}= useContext(MusicContext);
const [show, setShow] = useState(false);
const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
const navigate=useNavigate();
const location=useLocation();
const exitMsg=location.state
useEffect(()=>{
    if(!exitMsg) return;
    setNotification({ show: true,
        msg: exitMsg?.msg,
        variant: "warning",})
},[exitMsg]);

const {user,handleLogOut}=useContext(AuthContext);
  return (
      <section className="container-fluid dashboard-bg vh-100 d-flex justify-content-center align-items-center">
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
          <button
              className="btn-menu position-fixed top-0 start-0 p-2 m-3"
              onClick={handleShow}
          >
              <FiMenu />
          </button>
          <Offcanvas show={show} onHide={handleClose}>
              <Offcanvas.Header className="bg-secondary text-white" closeButton>
                  <Offcanvas.Title>Menu</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                  <Accordion flush>
                      <Accordion.Item eventKey="0">
                          <Accordion.Header>
                              <ProfileCircle className="me-2" /> Profile
                          </Accordion.Header>
                          <Accordion.Body>
                              User Name : {user?.name || "N/A"}
                              <br />
                              User Email :{user?.email || "N/A"}
                          </Accordion.Body>
                      </Accordion.Item>
                     
                  </Accordion>
              </Offcanvas.Body>
              <div className=" d-flex justify-content-between p-2">
                  <button
                      className=" btn btn-dark p-2"
                      onClick={() => navigate('/about')}
                  >
                      <InfoCircle /> About us
                  </button>
                 
                  <button
                      className="btn-logout p-2"
                      onClick={() => setShowModal(true)}
                  >
                      <LogOut /> LogOut
                  </button>
              </div>
          </Offcanvas>
          <MyModal
              show={showModal}
              onHide={() => {
                  setShowModal(false);
              }}
              title="Confirm"
              content="Are you sure to logout ?"
              confirmText="Logout"
              onConfirm={() => {
                  handleLogOut();
                  setShowModal(false);
              }}
          />
          <div className="text-center text-white d-flex flex-column align-items-md-center">
              <h1 className="mb-3 ">Welcome to Group Music</h1>
              <div className=" d-flex col-md-6 flex-column align-items-center">
                  <input
                      name=""
                      id=""
                      className="btn w-75 btn-create mb-3"
                      type="button"
                      value="Create Room"
                      onClick={() => {
                          navigate("/create-room");
                      }}
                  />
                  <input
                      name=""
                      id=""
                      className="btn btn-join w-75 "
                      type="button"
                      value="Join Room"
                      onClick={() => {
                          navigate("/join-room");
                      }}
                  />
              </div>
          </div>
      </section>
  );
}
 
export default DashboardPage;