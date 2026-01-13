import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import '../styles/global.css';
import API from "../services/api";
import { useParams, useLocation, Link } from "react-router-dom";
import { Toast, Alert, ToastContainer } from "react-bootstrap";
import {
    PauseSolid,
    PlaySolid,
    SkipNextSolid,
    SkipPrevSolid,
    MusicNotePlusSolid,
    XmarkCircleSolid,
} from "iconoir-react";

import io from "socket.io-client";

const MusicRoom = () => {
    const { id } = useParams();
    const roomCode = id;
    const [toastQueue, setToastQueue] = useState([]);
    const [currentToast, setCurrentToast] = useState(null);

    // const [toastMsg, setToastMsg] = useState({show:false,msg:'',variant:''});
    const { state } = useLocation();
    const userName = state?.userName;

    const [files, setFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const audioRef = useRef(null);
    const socketRef = useRef(null);
    const fileInputRef=useRef(null);

    const rafRef = useRef(null);
    const [progress, setProgress] = useState(0);
    
    const [notification, setNotification] = useState({
        msg: "vanakam",
        show: false,
        variant: "success",
    });

    const addToast = (msg, variant = "success") => {
        setToastQueue((prev) => [...prev, { msg, variant }]);
    };
    useEffect(() => {
        if (!currentToast && toastQueue.length > 0) {
            // Take the first toast from the queue
            setCurrentToast(toastQueue[0]);
            // Remove it from the queue
            setToastQueue((prev) => prev.slice(1));

            // Hide it after 3 seconds
            const timer = setTimeout(() => {
                setCurrentToast(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [toastQueue, currentToast]);

    useEffect(() => {
        if (!userName) {
            addToast("Unknown User", "warning");
            return; // exit early if username is missing
        }
        const socket = io(import.meta.env.VITE_SERVER_URL);
        socketRef.current = socket;

        
        socketRef.current.emit("join-room", { roomId: roomCode, userName });

        socketRef.current.on("user-joined", ({ message }) => {
            console.log(message);
            addToast(message, "success");
        });

        socketRef.current.on("user-left", ({ message }) => {
            addToast(message, "danger");
        });

        socketRef.current.on("song-added", (song) => {
       
        setFiles(prev => {
            const exists=prev.some(f=>f.fileName===song.fileName);
            if(exists) return prev;
            return [...prev,song];
        });
            
        });
        socketRef.current.on("load-existing-songs", (songs) => {
            setFiles(songs);
        });
    

        socketRef.current.on("sync-play", ({ audioIndex, currentTime }) => {
            setCurrentIndex(audioIndex);
            setCurrentTime(currentTime);
            setIsPlaying(true);
        });

        socketRef.current.on("sync-pause", ({ currentTime }) => {
            setCurrentTime(currentTime);
            setIsPlaying(false);
        });

        socketRef.current.on("sync-seek", ({ currentTime }) => {
            setCurrentTime(currentTime);
            if (audioRef.current) audioRef.current.currentTime = currentTime;
        });

        socketRef.current.on("sync-next", ({ index }) => {
            setCurrentIndex(index);
        });

        socketRef.current.on("sync-prev", ({ index }) => {
            setCurrentIndex(index);
        });

        socketRef.current.on(
            "sync-remove",
            ({ index, removedBy, fileName }) => {
                setFiles((prev) => prev.filter((_, i) => i !== index));

                if (index === currentIndex) {
                    setCurrentIndex(0);
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                }
                addToast(
                    `${removedBy} removed "${fileName}" from the playlist`,
                    "warning"
                );
            }
        );

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(()=>{
        console.table(files);
    },[files]);
    
    useEffect(() => {
        if (!audioRef.current || files.length === 0 || !files[currentIndex])
            return;

        const audio = audioRef.current;

        // Build the URL (replace with your server path)
        const audioUrl =
            files[currentIndex]?.url ||
            `${import.meta.env.VITE_SERVER_URL}/uploads/${
                files[currentIndex].fileName
            }`;

        audio.src = audioUrl;

        const playOrPause = async () => {
            try {
                if (isPlaying) {
                    await audio.play();
                } else {
                    audio.pause();
                }
            } catch (err) {
                console.error("Audio play error:", err);
                setNotification({
                    msg: "Error when trying to play song",
                    show: true,
                    variant: "danger",
                });
            }
        };

        playOrPause();
    }, [currentIndex, isPlaying, files]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    };
    const formattedCurrentTime = useMemo(
        () => formatTime(currentTime),
        [currentTime]
    );
    const formattedDuration = useMemo(() => {
        return audioRef.current?.duration
            ? formatTime(audioRef.current.duration)
            : "00:00";
    }, [audioRef.current?.duration]);

    const handleSeek = (e) => {
        if (!audioRef.current.duration) return;

        const newTime = (e.target.value / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(e.target.value);
        socketRef.current.emit("seek-song", {
            roomId: roomCode,
            currentTime: newTime,
        });
    };

    const handleFileUpload = useCallback(
        (e) => setUploadFiles(Array.from(e.target.files)),
        [uploadFiles]
    );

    const handleFileSubmit = useCallback(async () => {
        setIsUploading(true);
        if (!uploadFiles.length) return setIsUploading(false);
        const formData = new FormData();

        if (uploadFiles && uploadFiles.length > 0) {
            uploadFiles.forEach((file) => formData.append("audios", file));
        }

        const { data } = await API.post(
            `/api/room/audioUpload/${roomCode}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        data.added.forEach((f) =>
            socketRef.current.emit("song-added", { roomId: roomCode, song: f})
        );
        // console.log(data.name);
        console.log(data.audioFiles);
        
        if(data.duplicates.length>0){
            
            setNotification({
                msg: `Skipped ${data.duplicates.length} duplicate ${data.duplicates.length==1 ? 'song': 'songs'} added by ${userName}`,
                show: true,
                variant: 'warning'
            });
        }else{
            addToast(`${data.message}, Added By ${userName}`);
        }
        setUploadFiles([]);
        fileInputRef.current.value='';
        setIsUploading(false);
    }, [uploadFiles, roomCode,userName]);


    const handlePlayPause = useCallback(() => {
        if (files.length === 0) return;

        const newState = !isPlaying;
        setIsPlaying(newState);

        if (newState) {
            socketRef.current.emit("play-song", {
                roomId: roomCode,
                audioIndex: currentIndex,
                currentTime,
            });
        } else {
            socketRef.current.emit("pause-song", {
                roomId: roomCode,
                currentTime,
            });
        }
    }, [files.length, isPlaying, currentIndex, currentTime, roomCode]);

    const handlePrevSong = useCallback(() => {
        const prevIndex = (currentIndex - 1 + files.length) % files.length;
        setCurrentIndex(prevIndex);
        socketRef.current.emit("prev-song", {
            roomId: roomCode,
            index: prevIndex,
        });
    }, [currentIndex, files.length, roomCode]);

    
    const handleNextSong = useCallback(() => {
        const nextIndex = (currentIndex + 1) % files.length;

        setCurrentIndex(nextIndex);

        socketRef.current.emit("next-song", {
            roomId: roomCode,
            index: nextIndex,
        });
    }, [files.length, currentIndex, roomCode]);

    const handleRemoveSong = useCallback(
        async (index) => {
            const file = files[index];
            if (!file) return;

            await API.delete(`/api/room/deleteSong/${roomCode}/${file.fileName}`);

            socketRef.current.emit("remove-song", {
                roomId: roomCode,
                index,
                fileName: file.fileName,
                removedBy: userName,
            });
        },
        [files, roomCode, userName]
    );

    const handleTimeUpdate = useCallback(() => {
        if (!audioRef.current?.duration) return;
        const current = audioRef.current.currentTime;
        setCurrentTime(current);
        setProgress((current / audioRef.current.duration) * 100);
    }, []);

    useEffect(() => {
        const update = () => {
            handleTimeUpdate();
            rafRef.current = requestAnimationFrame(update);
        };

        if (isPlaying) {
            rafRef.current = requestAnimationFrame(update);
        }

        return () => {
            cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, handleTimeUpdate]);

    return ( ! userName ? <section className=" container-fluid bg-black vh-100 vw-100 d-flex justify-content-center align-items-center">
        <div className="text-white text-center">
            <p className="h1">Unknown User !!!</p>
            <p> User must enter the room filling the join room page 
               </p>
               <p> <Link to='/dashboard' className="btn btn-primary m-3">Home Page</Link>
                   
<Link to='/join-room' className="btn btn-primary m-3">Join room</Link>
                 </p>
        </div>
    </section>:
        <section className="music-controls vw-100 vh-100">
                        <Link
                            to="/dashboard"
                            className="btn btn-primary position-fixed top-0 end-0 m-3 z-3"
                        >
                            Back
                        </Link>
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
                    style={{zIndex:1000}}
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
            <audio
                ref={audioRef}
                onEnded={() => {
                    if (files.length === 0) return;
                    handleNextSong();
                }}
            />

            <section className="container-fluid p-md-5 d-flex flex-column w-100 h-100">
                {/* Room Code */}
                <section className="d-flex justify-content-center w-100 align-items-center p-2" style={{height:'11%'}}>
                    <section className="room-code-section d-flex flex-column align-items-center p-2 rounded-3 w-75 h-100">
                        <p className="m-0 text-white">Room Code: {roomCode}</p>
                    </section>
                </section>

                <section className="container-fluid w-100 d-flex flex-column flex-md-row justify-content-md-center align-items-md-center" style={{height:'88%'}}>
                    {/* MAIN PLAYER */}
                    <section className="d-flex fix justify-content-center w-100  align-items-center p-2 ">
                        <section className="player-section container-md d-flex flex-column align-items-center p-2 rounded-3 w-75 h-100">
                            {/* Image */}
                            <div className="col-8 h-50 mb-2 d-flex justify-content-center">
                                <img
                                    src="/images/playlist-img.jpg"
                                    alt="music"
                                    className="rounded-circle img-fluid"
                                />
                            </div>

                            {/* Song Title */}
                            <p className="fw-medium text-white h-10 text-center text-truncate w-100 m-0 fs-6">
                                {files[currentIndex]
                                    ? `Song Name: ${files[currentIndex].fileName}`
                                    : "No Song Selected "}
                            </p>

                            {/* Range */}
                            <div className="music-range-controllers w-100 d-flex align-items-center justify-content-between mt-3 text-center">
                                <p className="text-white m-0">
                                    {formattedCurrentTime}
                                </p>
                                <input
                                    type="range"
                                    aria-label="Music progress"
                                    value={progress}
                                    onChange={handleSeek}
                                    className="w-50 w-lg-90"
                                />
                                <p className="text-white m-0">
                                    {formattedDuration}
                                </p>
                            </div>

                            {/* Music Controls */}
                            <div className="d-flex justify-content-center h-20 align-items-center mt-3 gap-4">
                                <SkipPrevSolid
                                    color="white"
                                    onClick={handlePrevSong}
                                />
                                {isPlaying ? (
                                    <PauseSolid
                                        color="white"
                                        onClick={handlePlayPause}
                                    />
                                ) : (
                                    <PlaySolid
                                        color="white"
                                        onClick={handlePlayPause}
                                    />
                                )}
                                <SkipNextSolid
                                    color="white"
                                    onClick={handleNextSong}
                                />
                            </div>
                        </section>
                    </section>

                    {/* PLAYLIST SECTION */}
                    <section className="d-flex fix1 flex-column justify-content-start w-100 flex-md-grow-1 align-items-center p-2">
                        <div
                            className="room-code-section h-100 d-flex flex-column align-items-center position-relative p-2 rounded-3"
                            style={{ width: "95%", overflowY: "auto" }}
                        >
                            {/* Playlist List */}
                            <div className="w-100 h-75  overflow-scroll d-flex flex-column">
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
                                                backgroundColor:currentIndex === index ? 'rgba(255, 0, 0, 0.1)' : 
                                                    "rgba(255, 255, 255, 0.1)"
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
                                                    {file.fileName||''}
                                                </p>
                                            </div>

                                            <div className="d-flex align-items-center">
                                                <PlaySolid
                                                    className="bg-outline-info text-white"
                                                    onClick={() => {
                                                        setCurrentIndex(index);
                                                        setIsPlaying(true);
                                                        socketRef.current.emit(
                                                            "play-song",
                                                            {
                                                                roomId: roomCode,
                                                                audioIndex:
                                                                    index,
                                                                currentTime: 0,
                                                            }
                                                        );
                                                        return index;
                                                    }}
                                                />
                                                <XmarkCircleSolid
                                                    onClick={() =>
                                                        handleRemoveSong(index)
                                                    }
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* File Upload Button */}
                            <div className="w-100 h-25 p-2 d-flex  justify-content-center align-items-center gap-2 position-absolute bottom-0 m-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    name="musicUploader"
                                    className="container btn btn-primary mt-2 "
                                    accept="audio/*"
                                    placeholder=""
                                    multiple
                                    onChange={handleFileUpload}
                                />

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    name="musicUploader"
                                    className="btn btn-success con mt-2"
                                    onClick={handleFileSubmit}
                                >
                                    {isUploading?'Submitting':'Submit'}
                                </button>
                            </div>
                        </div>
                    </section>
                </section>
            </section>
        </section>
    );
};

export default MusicRoom;
