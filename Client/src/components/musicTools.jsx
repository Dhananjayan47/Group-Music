import React, { useState, useRef, useContext, useCallback} from "react";

import API from "../services/api";
// import {  useParams} from "react-router-dom";
import { MdOutlineSpeed, MdDelete } from "react-icons/md";
import { IoShuffleOutline } from "react-icons/io5";
import {
    TbRepeatOnce,
    TbRepeat,
    TbPlayerPlayFilled,
    TbPlayerPauseFilled,
    TbPlayerSkipBackFilled,
    TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import {
    Popover,
    Spinner,
    Table,
    Accordion,
    Card,
    ListGroup,
   
    Badge,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";
import { MusicContext } from "../context/AuthContext";
// import io from "socket.io-client";

const MusicController = () => {
    const {
        isHost,
        roomState,
        playlistMode,
       currentSong,
        socketRef,
       
        loop,
        roomCode,
        userName,
        displaySeek,
        roomDetails,
        
        isSeekingRef,
        addToast,
        setLoaded,
        setDisplaySeek,
        rate,
        duration,
        loaded,
    } = useContext(MusicContext);

    const playing = roomState?.playing ?? false;

   
    const handleToggle = useCallback(() => {
        if (roomState?.files.length === 0) return;

        if (!isHost) {
            addToast("Only the host can play or pause songs.", "warning");
            return;
        }
        
        if (!roomState?.playing) {
            socketRef.current.emit("play-song", { roomId: roomCode });
          } else {
            socketRef.current.emit("pause-song", { roomId: roomCode });
          }
          
    }, [
        roomState?.files.length,
        
        addToast,
       isHost,
        roomState?.playing,
        roomCode,
        socketRef,
    ]);

 
    const playNext = useCallback(() => {
        if (!isHost) {
            addToast("Only the host can play next song.", "warning");
            return;
        }
        
        setLoaded(false);
        socketRef.current.emit("next-song", {
            roomId: roomCode,
            
        });
    }, [
       isHost,
        setLoaded,
        addToast,
        roomCode,
        socketRef,
    ]);
    
    // Previous song
    const playPrev = useCallback(() => {
        if (!isHost) {
            addToast("Only the host can play previous song.", "warning");
            return;
        }
        if (loop) return;
        
        setLoaded(false);
        socketRef.current.emit("prev-song", {
            roomId: roomCode,
        });
    }, [isHost,setLoaded, addToast, socketRef, loop, roomCode]);

    const handleSeekingChange = (e) => {
        if (!isHost) {
            addToast("Only the host can seek 2 songs.", "warning");
            return;
        }
        setDisplaySeek(Number(e.target.value));
    };

    const handleSeekStart = () => {
        if (!isHost) {
            addToast("Only the host can seek 1 songs.", "warning");
            return;
        }
        isSeekingRef.current = true;       
    };

    const handleSeekEnd = (e) => {
        if (!isHost) {
            addToast("Only the host can seek 3 songs.", "warning");
            return;
        }

        const seek = Number(e.target.value);

        isSeekingRef.current=false

        setDisplaySeek(seek);
        socketRef.current.emit("seek", {
            roomId: roomCode,
            seek,
        });
    };

    const changePlayingMode = (val) => {
        

        socketRef.current.emit("change-playlist-mode", {
            roomId: roomCode,
            mode: val,
        });
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
        )}`;
    };

    const handleRateChange = (value) => {
        if (userName !== roomDetails?.createdBy) {
            addToast("Only the host can play previous song.", "warning");
            return;
        }
     

        socketRef.current.emit("on-rate", { roomId: roomCode, value });
    };

    const popover = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Rate : {rate}</Popover.Header>
            <Popover.Body>
                <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => handleRateChange(e.target.value)}
                />
            </Popover.Body>
        </Popover>
    );

    const percent = duration ? (displaySeek / duration) * 100 : 0;

    return (
        <section className="glass p-0 h-100 d-flex flex-column justify-content-center">
            <section className="d-none"></section>
            <section className="container-fluid w-100 h-100 px-0" >
                <section className="container-fluid w-100 shadow p-2 border rounded-3 h-100  d-flex flex-column align-items-center justify-content-around">
                    <section className="container-fluid p-0 h-75 d-flex flex-column align-items-center justify-content-between">
                        <section
                            className="w-75 h-75 p-2 rounded-circle "
                            style={{
                                border: "2px solid white ",
                            }}
                        >
                            <img
                                src="/images/bg1.png"
                                className=" z-1 rounded-circle border-info h-100 w-100"
                            />
                        </section>
                        <p className="w-100 text-white text-nowrap text-center d-block overflow-x-hidden text-truncate">
                            {loaded ? currentSong.fileName : <span className=" text-center w-100 d-block">LOADING</span>}
                        </p>
                        <section className="w-100 text-white text-center d-flex align-items-baseline justify-content-evenly">
                            <p className="text-white text-center ">
                                {formatTime(displaySeek)}
                            </p>
                            <section className="w-50 text-center d-flex">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={
                                        userName !== roomDetails?.createdBy ? (
                                            <Tooltip id="seek-tooltip">
                                                Only the host can seek songs
                                            </Tooltip>
                                        ) : (
                                            <div className="d-none">hii</div>
                                        )
                                    }
                                    delay={{ show: 200, hide: 200 }}
                                >
                                    <div style={{ width: "100%" }}>
                                        <input
                                            className="custom-range align-self-center"
                                            type="range"
                                            style={{
                                                cursor:
                                                    userName !==
                                                    roomDetails?.createdBy
                                                        ? "not-allowed"
                                                        : "pointer",
                                                pointerEvents:
                                                    userName !==
                                                    roomDetails?.createdBy
                                                        ? "none"
                                                        : "auto",
                                                "--range-percent": `${percent}%`,
                                                "--range-fill": "#4e75a1",
                                                width: "100%",
                                            }}
                                            min="0"
                                            max={
                                                duration
                                                    ? duration.toFixed(2)
                                                    : 0
                                            }
                                            step=".01"
                                            value={displaySeek}
                                            onChange={handleSeekingChange}
                                            onMouseDown={handleSeekStart}
                                            onMouseUp={handleSeekEnd}
                                        />
                                    </div>
                                </OverlayTrigger>
                            </section>
                            <p className="text-white mb-2">
                                {formatTime(duration)}
                            </p>
                        </section>
                    </section>
                    <section
                        className="container-fluid text-white p-5 d-flex justify-content-between align-items-center shadow border border-2 rounded rounded-pill"
                        style={{ height: "10%" , background:"rgba(0,0,0,0.45)"}}
                    >
                        <OverlayTrigger
                            trigger="click"
                            placement="top"
                            overlay={popover}
                        >
                            <MdOutlineSpeed size={25} />
                        </OverlayTrigger>

                        <TbPlayerSkipBackFilled size={25} onClick={playPrev} />

                        {loaded ? (
                            playing ? (
                                <TbPlayerPauseFilled
                                    size={25}
                                    onClick={handleToggle}
                                />
                            ) : (
                                <TbPlayerPlayFilled
                                    size={25}
                                    onClick={handleToggle}
                                />
                            )
                        ) : (
                            <Spinner className="text-dark" animation="grow" />
                        )}

                        <TbPlayerSkipForwardFilled
                            size={25}
                            onClick={playNext}
                        />

                        {playlistMode === "loop" ? (
                            <TbRepeat
                                size={25}
                                onClick={() => changePlayingMode("loopOnce")}
                            />
                        ) : playlistMode === "loopOnce" ? (
                            <TbRepeatOnce
                                size={25}
                                onClick={() => changePlayingMode("shuffle")}
                            />
                        ) : (
                            <IoShuffleOutline
                                size={25}
                                onClick={() => changePlayingMode("loop")}
                            />
                        )}
                    </section>
                </section>
            </section>
        </section>
    );
};

const MusicPlaylist = () => {
    //  const files=playlistData
    const {
        socketRef,
        setNotification,
        roomState,
        addToast,
        roomCode,
        roomDetails,
        files,
        userName,
        currentIndex,
    } = useContext(MusicContext);

    

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);

    const handleFileUpload = useCallback(
        (e) => setUploadFiles(Array.from(e.target.files)),
        []
    );
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
            2,
            "0"
        )}`;
    };

    const handleRemoveSong = useCallback(
        async (index) => {
            if (userName !== roomDetails?.createdBy) {
                addToast("Only the host can remove songs.", "warning");
                return;
            }
            const file = files[index];
            if (!file) return;
            
            await API.delete(
                `/api/room/deleteSong/${roomCode}/${file.savedFileName}`
            );
            // setFiles((prev) => prev.filter((_, i) => i !== index));
            let whichIndexSongDeleted;
            if (currentIndex === index) {
                whichIndexSongDeleted = "current";
            } else if (currentIndex > index) {
                whichIndexSongDeleted = "low";
            }
            if (socketRef.current) {
                socketRef.current.emit("remove-song", {
                    roomId: roomCode,
                    change: whichIndexSongDeleted,
                    index,
                    fileName: file.fileName,
                    removedBy: userName,
                });
            }
        },
        [
            files,
            addToast,
            
            roomDetails?.createdBy,
            currentIndex,
            roomCode,
            userName,
            socketRef,
        ]
    );

    const handleFileSubmit = useCallback(async () => {
        if (!uploadFiles.length) return;

      
        
        setIsUploading(true);
        const formData = new FormData();
        
        uploadFiles.forEach((file) => formData.append("audios", file));
       
        
        try {
            
            const { data } = await API.post(
                `/api/room/audioUpload/${roomCode}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
           
            if (data.added.length > 0) {
                // setFiles(prev => [...prev, ...data.added]);
                socketRef.current.emit("song-added", {
                    roomId: roomCode,
                    msg: data.message,
                    sender: userName,
                });
            }
        } catch (error) {
            setNotification({
                msg: `Server Errror : ${error}`,
                show: true,
                variant: "danger",
            });
        }
        setUploadFiles([]);
        fileInputRef.current.value = "";
        setIsUploading(false);
    }, [uploadFiles, setNotification, roomCode, userName, socketRef]);

    return (
        <section className="p-0 container-fluid d-flex flex-column justify-content-center h-100">
            <section className="container-fluid w-100 h-100 px-0">
                <section className="w-100 h-75 bg-dark bg-opacity-25 rounded-3 p-2 overflow-x-hidden shadow overflow-auto d-flex flex-column">
                    <ul className="w-100 h-75 text-white list-unstyled d-flex flex-column align-items-center gap-2">
                        {files.length === 0 && (
                            <p className="text-white mt-4 opacity-50">
                                No songs uploaded yet
                            </p>
                        )}

                        {files.map((file, index) => (
                            <li
                                key={file.fileName}
                                className={`w-100 d-flex justify-content-between align-items-center p-2 rounded-3`}
                                style={{
                                    backgroundColor:
                                        roomState.currentIndex === index
                                            ? "rgba(70, 70, 70, 0.1)"
                                            : "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <img
                                        src="/images/playlist-img.jpg"
                                        alt="music"
                                        className="rounded-3 img-fluid"
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                        }}
                                    />

                                    <p
                                        className="m-0 text-truncate"
                                        style={{
                                            maxWidth: "150px",
                                        }}
                                    >
                                        {file ? file.fileName : ""}
                                    </p>
                                </div>
                                <div>
                                    <span>{formatTime(file.duration)}
                                    </span>
                                </div>

                                <div className="d-flex align-items-center">
                                    
                                    <MdDelete
                                        onClick={() => handleRemoveSong(index)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* File Upload Button */}
                <div className="w-100 h-25 p-2 d-flex  justify-content-center align-items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        name="musicUploader"
                        accept="audio/*"
                        placeholder=""
                        multiple
                        className="d-none"
                        onChange={handleFileUpload}
                    />
                    <button
                        type="button"
                        className="btn btn-primary shadow mt-2"
                        disabled={uploadFiles.length>0}
                        onClick={() => fileInputRef.current.click()}
                    >
                        🎵 Choose Audio Files
                    </button>
                    <button
                        type="submit"
                        disabled={isUploading}
                        name="musicUploader"
                        className="btn btn-success shadow mt-2"
                        onClick={handleFileSubmit}
                    >
                        {isUploading ? "Submitting" : "Submit"}
                    </button>
                </div>
            </section>
        </section>
    );
};

const MusicRoomInfo = () => {
    const { roomDetails, hostName, usersInRoom } = useContext(MusicContext);

    return (
        <section className="p-3 h-100 container-fluid d-flex justify-content-center">
            <Card className="shadow bg-dark bg-opacity-25 w-100 text-white overflow-hidden" style={{ maxWidth: "600px" }}>
                <Card.Body>
                    <Card.Title className="text-center mb-3">
                        🎵 Welcome to Our Music Room
                    </Card.Title>
                    <Card.Text className="text-center text-white mb-4">
                        Enjoy listening to your favorite music together!
                    </Card.Text>

                    <Table bordered hover responsive variant="dark" >
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Room Name</strong>
                                </td>
                                <td>{roomDetails?.roomName || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Room Id</strong>
                                </td>
                                <td>{roomDetails?.roomId || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Host</strong>
                                </td>
                                <td>{hostName || "N/A"}</td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Listeners</strong>
                                </td>
                                <td className="p-0 bg-dark">
                                    <Accordion className="bg-dark">
                                        <Accordion.Item eventKey="0">
                                            <Accordion.Header>
                                                <Badge bg="info">
                                                    {usersInRoom.length}
                                                </Badge>{" "}
                                                users
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <ListGroup variant="flush" >
                                                    {usersInRoom.map(
                                                        (user, idx) => (
                                                            <ListGroup.Item
                                                                key={idx}
                                                            >
                                                                {user}
                                                            </ListGroup.Item>
                                                        )
                                                    )}
                                                </ListGroup>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                   
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <strong>Songs</strong>
                                </td>
                                <td>
                                    <Badge bg="success">
                                        {roomDetails?.audios?.length || 0}
                                    </Badge>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </section>
    );
};

export { MusicController, MusicPlaylist, MusicRoomInfo };
