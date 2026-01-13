import React, { useContext, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import ReactHowler from "react-howler";
import { ButtonGroup, Button,ToastContainer,Toast,Alert,Offcanvas,Accordion } from "react-bootstrap";
import { MusicController,MusicPlaylist,MusicRoomInfo } from "./musicTools";
import { HeadsetSolid, Playlist, InfoCircle,ProfileCircle,LogOut } from "iconoir-react";
import {HiMiniArrowLeftOnRectangle,HiHome} from "react-icons/hi2"
import { AuthContext, MusicContext } from "../context/AuthContext";
import MyModal from "./Modal";
import { FaQuestion } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import ErrorPage from "./ErrorPage";

const FullControl = () => {
    const navigate=useNavigate();
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [active, setActive] = useState("page2");
    const {user,handleLogOut}=useContext(AuthContext);
    const {currentSong,roomState,setRoomState,isHost,isSeekingRef,rate, playerRef,hostName,setUserName,setLoaded,setDuration,roomCode,setRoomCode,userName,currentToast,setPlaying,setNotification,socketRef,notification,setCurrentToast}=useContext(MusicContext)
    // const files=roomState?.files ?? []
    
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [modalMsg, setModalMsg] = useState({title:'',content:'',confirmText:'',onConfirm:null});
    const handleLeaveRoom = () => {
        if(socketRef.current){
          socketRef.current.emit('leave-room') 
        }
        if(userName===hostName) return;
        
        setRoomState({files: [],
            currentIndex: 0,
            seek: 0,
            startedAt: null,
            playing: false,
            playlistMode: "loop",
            shuffledIndices: [],
            rate: 1,
            duration: 0,})
        setPlaying(false);
        setLoaded(false);
        setDuration(0);
        setUserName('')
        setRoomCode("");
        navigate("/dashboard")
      };

          const handleOnLoad = () => {     

            if (!roomState ) return;

            setLoaded(true);
            
            if (isSeekingRef.current) return;
            /* 🎯 1. ALIGN PLAYER SEEK FOR ALL CLIENTS */
            if (roomState.playing && roomState.startedAt) {
              const elapsed =
                (Date.now() - roomState.startedAt) / 1000;
      
              playerRef.current.seek(
                Math.min(roomState.seek + elapsed, roomState.duration)
              );
            } else {
              playerRef.current.seek(roomState.seek);
            }

            if(isHost){
               

           const duration =playerRef.current.duration();
           socketRef.current.emit('on-load',{roomId:roomCode,duration})}
        }


        const onEndFunction=()=>{
            if(isHost && socketRef.current){
                // setLoaded(false);
                socketRef.current.emit('song-ended',{roomId:roomCode})
            }
        }


       


    return !userName || !roomCode ? (
        <ErrorPage />
    ) : (
        <section
            className="container-fluid p-0 vw-100 vh-100 d-flex flex-column align-items-center justify-content-around"
            style={{
                background:
                    "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #020617 100%)",
            }}
        >
            <ToastContainer
                position="bottom-end"
                className="p-3"
                style={{ zIndex: 1000 }}
            >
                {currentToast && (
                    <Toast
                        show={true}
                        bg={currentToast.variant}
                        animation={true}
                        onClose={() => setCurrentToast(null)}
                        delay={3000}
                        autohide
                    >
                        <Toast.Header>
                            <strong className="me-auto">Notification</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body>{currentToast.msg}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>

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
            {currentSong?.url && (
                <ReactHowler
                    key={roomState?.currentIndex}
                    src={currentSong?.url}
                    playing={roomState.playing}
                    onLoad={handleOnLoad}
                    rate={rate}
                    onEnd={onEndFunction}
                    loop={roomState.playlistMode === "loopOnce"}
                    html5={false}
                    ref={playerRef}
                />
            )}
            <div
                style={{ height: "4%" }}
                className="w-100 text-white d-flex justify-content-around align-items-center px-3"
            >
                <HiHome
                    size={20}
                    onClick={() => {
                        setModalMsg({
                            title: "Go to Home ",
                            content:
                                "Are you sure you want to leave this room ?",
                            confirmText: "Leave",
                            onConfirm: () => {
                                handleLeaveRoom(), setShowLeaveModal(false);
                            },
                        });
                        setShowLeaveModal(true);
                    }}
                />
                <FaQuestion
                    size={18}
                    onClick={() => {
                        setModalMsg({
                            title: "Why this ?",
                            content:
                                active === "page1"
                                    ? "This info page show about Room Details "
                                    : active === "page2"
                                    ? "This is control room & it show the Music Controllers "
                                    : "This is playlist page. Here you see all the songs added by you & roommates",
                            confirmText: "?",
                            onConfirm: () => {
                                setShowLeaveModal(false);
                            },
                        });
                        setShowLeaveModal(true);
                    }}
                />
                <FiMenu size={20} onClick={() => setShowOffCanvas(true)} />
            </div>
            <Offcanvas
                show={showOffCanvas}
                placement={"end"}
                onHide={() => setShowOffCanvas(false)}
            >
                <Offcanvas.Header
                    className="bg-secondary text-white"
                    closeButton
                >
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
                <div className=" d-flex justify-content-end p-2">
                    
                    <button
                        className="btn-logout p-2"
                        onClick={() => {
                            setModalMsg({
                                title: "Confirm",
                                content: "Are you sure to logout ?",
                                confirmText: "Logout",
                                onConfirm: () => {
                                    handleLogOut(), setShowLeaveModal(false);
                                },
                            });
                            setShowLeaveModal(true);
                        }}
                    >
                        <LogOut /> LogOut
                    </button>
                </div>
            </Offcanvas>
            <div style={{ height: "75% ", width: "90%" }}>
                {active === "page1" && <MusicRoomInfo />}
                {active === "page2" && <MusicController />}
                {active === "page3" && <MusicPlaylist />}
            </div>
            <div className="d-flex flex-column w-75" style={{ height: "10%" }}>
                <ButtonGroup className="w-100">
                    <Button
                        //   style={{background:"#A855F7"}}
                        variant="dark"
                        active={active === "page1"}
                        onClick={() => setActive("page1")}
                    >
                        <InfoCircle />
                    </Button>

                    <Button
                        //   style={{background:"#06B6D4"}}
                        variant="dark"
                        active={active === "page2"}
                        onClick={() => setActive("page2")}
                    >
                        <HeadsetSolid />
                    </Button>
                    <Button
                        //   style={{background:"#FB7185"}}
                        variant="dark"
                        active={active === "page3"}
                        onClick={() => setActive("page3")}
                    >
                        <Playlist />
                    </Button>
                    <Button
                    variant="dark"
                        
                        onClick={() => {
                            setModalMsg({
                                title: "Leave Room",
                                content:
                                    "Are you sure you want to leave this room ?",
                                confirmText: "Leave",
                                onConfirm: () => {
                                    handleLeaveRoom(), setShowLeaveModal(false);
                                },
                            });
                            setShowLeaveModal(true);
                        }}
                    >
                        <HiMiniArrowLeftOnRectangle size={20} />
                    </Button>
                </ButtonGroup>
                <MyModal
                    show={showLeaveModal}
                    onHide={() => {
                        setShowLeaveModal(false);
                        setModalMsg({
                            title: "",
                            content: "",
                            confirmText: "",
                            onConfirm: null,
                        });
                    }}
                    title={modalMsg.title}
                    content={modalMsg.content}
                    confirmText={modalMsg.confirmText}
                    onConfirm={modalMsg.onConfirm}
                />
            </div>
        </section>
    );
};

export default FullControl;
