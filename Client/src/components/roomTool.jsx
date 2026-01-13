import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Toast, ToastContainer } from "react-bootstrap";
import { MusicContext } from "../context/AuthContext";

const CreateRoom = () => {
    const {setUserName,setHostName,setRoomDetails,setRoomCode}=useContext(MusicContext);
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState({
        msg: "",
        variant: "",
        show: false,
    });
    const [details, setDetails] = useState({ roomName: "", roomPassword: "" });
    const navigate = useNavigate();

    const handleInputs = (e) => {
        const { name, value } = e.target;

        setDetails((prev) => ({ ...prev, [name]: value }));
    };
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        
        if (!details.roomName.trim() || !details.roomPassword.trim()) {
            setShowToast({msg:"Room Name or Password cannot be empty",variant:"danger",show:true});
            return;
        }
        setIsLoading(true);
        
        try {
            const {data} = await API.post("/api/room/create", details);
            if (data.success) {
                // alert("Room Created Successfully");
                setDetails({ roomName: "", roomPassword: "" });
                const roomId = data.room.roomId;
                setUserName(data.name);
                setRoomDetails(data.room);
                setRoomCode(roomId);
                setHostName(data.room.createdBy);
                navigate(`/room/${roomId}`);
            }
        } catch (error) {
            if (!error.response) {
                setShowToast({
                    msg: "Network error. Please try again later.",
                    show: true,
                    variant: "danger",
                });
            }

            
            const message =
                error.response?.data?.message || "Something went wrong";
            setShowToast({ msg: message, show: true, variant: "danger" });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <section className="container vh-100 d-flex justify-content-center bg-secondary align-items-center p-5">
            <ToastContainer
                position="bottom-end"
                className="p-3"
                style={{ zIndex: 1000 }}
            >
                {showToast.show && (
                    <Toast
                        show={showToast.show}
                        bg={showToast.variant}
                        animation={true}
                        onClose={() =>
                            setShowToast({ msg: "", show: false, variant: "" })
                        }
                        delay={3000}
                        autohide
                    >
                        <Toast.Header>
                            <strong className="me-auto">Notification</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body>{showToast.msg}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
            <div className="h-auto border border-2 border-info p-2 bg-secondary-subtle rounded-5">
                <form className="p-3" onSubmit={handleCreateSubmit}>
                    <div className="mb-3">
                        <label htmlFor="roomName" className="form-label">
                            Room Name
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="roomName"
                            id="roomName"
                            value={details.roomName}
                            aria-describedby="helpId"
                            placeholder="Enter Here..."
                            onChange={handleInputs}
                        />
                        <small className="form-text text-muted">
                            {isLoading ? "Loading" : "Enter a Unique name"}
                        </small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="roomPass" className="form-label">
                            Room Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            name="roomPassword"
                            id="roomPass"
                            value={details.roomPassword}
                            placeholder="Enter Here..."
                            onChange={handleInputs}
                        />
                    </div>
                    <div className="d-flex justify-content-around">
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating..." : "Create"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                navigate("/dashboard");
                            }}
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

const JoinRoom = () => {
    const {setUserName,setRoomCode,setHostName,setRoomDetails}=useContext(MusicContext)
    const [details, setDetails] = useState({ roomId: "", roomPassword: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState({
        msg: "",
        variant: "",
        show: false,
    });
    const navigate = useNavigate();

    const handleInputs = (e) => {
        const { name, value } = e.target;

        setDetails((prev) => ({ ...prev, [name]: value }));
    };
    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        if(!details.roomId||!details.roomPassword)return setShowToast({msg:"Room Id or Password cannot be empty",variant:"danger",show:true});
        setIsLoading(true);
        try {
            const { data } = await API.post("/api/room/join", details);
            if (data.success) {
                const roomId = data.room.roomId;
                setUserName(data.name);
                setRoomDetails(data.room);
                setHostName(data.room.createdBy);
                setRoomCode(roomId);
               
                navigate(`/room/${roomId}`);
            } else {
                const message = data.message || "Invalid Room ID or Password";
                setShowToast({ msg: message, show: true, variant: "danger" });
            }
        } catch (err) {
            
            const message = "Something went wrong. Please try again!";
            setShowToast({ msg: message, show: true, variant: "danger" });
        }
        setDetails({ roomId: "", roomPassword: "" });
    };

    return (
        <section className="container vh-100 d-flex justify-content-center bg-secondary align-items-center p-5">
            <ToastContainer
                position="bottom-end"
                className="p-3"
                style={{ zIndex: 1000 }}
            >
                {showToast.show && (
                    <Toast
                        show={showToast.show}
                        bg={showToast.variant}
                        animation={true}
                        onClose={() =>
                            setShowToast({ msg: "", show: false, variant: "" })
                        }
                        delay={3000}
                        autohide
                    >
                        <Toast.Header>
                            <strong className="me-auto">Notification</strong>
                            <small className="text-muted">just now</small>
                        </Toast.Header>
                        <Toast.Body>{showToast.msg}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>
            <div className="h-auto border border-2 border-info p-2 bg-secondary-subtle rounded-5">
                <form className="p-3" onSubmit={handleJoinSubmit}>
                    <div className="mb-3">
                        <label htmlFor="roomId" className="form-label">
                            Room ID
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            name="roomId"
                            id="roomId"
                            aria-describedby="helpId"
                            value={details.roomId}
                            placeholder="Enter Here..."
                            onChange={handleInputs}
                        />
                        <small id="helpId" className="form-text text-muted">
                            Enter a Unique name{" "}
                        </small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="roomPass" className="form-label">
                            Room Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            name="roomPassword"
                            id="roomPass"
                            value={details.roomPassword}
                            placeholder="Enter Here..."
                            onChange={handleInputs}
                        />
                    </div>
                    <div className="d-flex justify-content-around">
                        <button type="submit" disabled={isLoading} className="btn btn-success">
                        {isLoading ? "Joining..." : "Join"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                navigate("/dashboard");
                            }}
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default CreateRoom;
export { JoinRoom };
