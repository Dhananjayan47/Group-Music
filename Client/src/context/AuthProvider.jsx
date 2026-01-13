import React, { useState, useEffect, useRef,useMemo, useCallback } from "react";
import API from "../services/api";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import raf from "raf";
import { Alert } from "react-bootstrap";
import { AuthContext, MusicContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await API.get("/api/user/refresh");
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      } catch {
        setAccessToken(null);
      }
    };
    restoreSession();
  }, []);

  const handleLogOut = async () => {
    try {
      const { data } = await API.post("/api/user/logout");
      
      if (data.success) {
        setUser("");
        setAccessToken("");
        navigate("/login",{state:`${data.message}`});
      } else {
        console.error(`${data.message}`);
      }
    } catch (error) {
      console.error(error);
      console.log(error.message);
    }
  };

  useEffect(() => {
    const interceptor = API.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await API.get("/api/user/refresh").then(
            (res) => res.data.accessToken
          );
          if (newToken) {
            API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            return API(originalRequest);
          } else {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
    return () => API.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={{ handleLogOut, accessToken, setAccessToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const MusicProvider = ({ children }) => {
  const socketRef = useRef(null);
  const playerRef = useRef(null);
  const navigate = useNavigate();

  const [displaySeek, setDisplaySeek] = useState(0);
  const [roomState, setRoomState] = useState({
    files: [],
    currentIndex: 0,
    seek: 0,
    startedAt: null,
    playing: false,
    playlistMode: "loop",
    shuffledIndices: [],
    rate: 1,
    duration: 0,
  });
  
  const isSeekingRef = useRef(false);
  const [loaded, setLoaded] = useState(false);
  // const [duration, setDuration] = useState(0);
  const rafRef = useRef(null);
  const [roomCode, setRoomCode] = useState("");
  const [userName, setUserName] = useState("");
  const [hostName, setHostName] = useState("");
  const isHost=(hostName === userName);
  // const loadedRef = useRef(false);

  const [usersInRoom, setUsersInRoom] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const files =  roomState?.files ?? [];
  

  const rate =  roomState?.rate ?? 1;
  const duration = roomState?.duration ?? 0;
  const playlistMode = roomState?.playlistMode ?? ""

  const playing = roomState?.playing ?? false;
  const [toastQueue, setToastQueue] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);
  const [notification, setNotification] = useState({ show: false, msg: "", variant: "light" });

  const addToast = useCallback((msg, variant = "light") => {
    setToastQueue((prev) => [...prev, { msg, variant }]);
  }, []);

  const roomStateRef = useRef(roomState);
  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);
  
  useEffect(() => {
    setLoaded(false);
  }, [roomState.currentIndex]);
  


  
  useEffect(() => {
    if (!playerRef.current) return;
  
    // setLoaded(false);
    setDisplaySeek(0);
  
   
    if (loaded) {
      playerRef.current.seek(0);
    }
  }, [roomState.currentIndex, loaded]);
  
  


  useEffect(()=>{
    playerRef.current?.rate(rate)
  },[rate])
  
  useEffect(() => {
    if (!roomCode || !userName) return;

    const socket = io(import.meta.env.VITE_SERVER_URL);
    socketRef.current = socket;

    socket.emit("join-room", { roomId: roomCode, userName });

    const onUserJoined = ({ message, roomState }) => {
      setRoomState(roomState);
      addToast(message, "success");
    };

    const onUserLeft = ({ message }) => {
      addToast(message, "danger");
    };

    const onRoomUsers = (users) => setUsersInRoom(users);
    const onErrorMessage = (msg) => addToast(msg, "warning");

  

    const onSyncSeeking = (value) => {
      if (isSeekingRef.current) {
        setDisplaySeek(value);
      }
      
    };

    const onSyncSeek = ({ seek }) => {
  
      if (!playerRef.current) return;
   
     
      const currentPos = playerRef.current.seek();
    if (Math.abs(currentPos - seek) > 0.5) {
        playerRef.current.seek(seek);
    }

     
    };

    const onSongAdded = ({ msg, sender }) => {
      addToast(`${msg} by ${sender}.`, "info");
    };

    const onSyncRemove = ({ removedBy, fileName }) => {
      addToast(`${fileName} song removed by ${removedBy}`, "warning");
    };

    const closeRoom = (msg) => {
      setRoomState({files: [],
        currentIndex: 0,
        seek: 0,
        startedAt: null,
        playing: false,
        playlistMode: "loop",
        shuffledIndices: [],
        rate: 1,
        duration: 0,});
      setLoaded(false);
      setRoomCode("");
      setHostName("");
      setDisplaySeek(0);
      navigate("/dashboard",{state:{msg:`${msg}`}});
    }

    const handleRoomState = ({ roomState }) => {
      setRoomState(roomState); 
    };

    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("roomUsers", onRoomUsers);
    socket.on("errorMessage", onErrorMessage);
    socket.on("sync-remove", onSyncRemove);
    socket.on("sync-added", onSongAdded);
    // socket.on("sync-load", onSyncLoad);
    socket.on("sync-seeking", onSyncSeeking);
    socket.on("sync-seek", onSyncSeek);
    // socket.on("sync-play-mode", (value) => setPlaylistMode(value));
    socket.on("room-closed", closeRoom);
    socket.on("room-state", handleRoomState);

    return () => {
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("roomUsers", onRoomUsers);
      socket.off("errorMessage", onErrorMessage);
      socket.off("sync-remove", onSyncRemove);
      socket.off("sync-added", onSongAdded);
      // socket.off("sync-load", onSyncLoad);
      socket.off("sync-seeking", onSyncSeeking);
      socket.off("sync-seek", onSyncSeek);
      // socket.off("sync-play-mode", (value) => setPlaylistMode(value));
      socket.off("room-closed", closeRoom);
      socket.off("room-state", handleRoomState);
      socket.disconnect();
    };
  }, [roomCode, userName]);

  useEffect(() => {
    if (!roomState || !loaded) return;

    raf.cancel(rafRef.current);

    const update = () => {
      if (!roomState) return;


      if (!isSeekingRef.current) {
        if ( roomStateRef.current.playing && roomStateRef.current.startedAt ) {
          const elapsed = (Date.now() - roomStateRef.current.startedAt) / 1000;
          const current = (roomStateRef.current?.seek ?? 0) + elapsed * rate;
          setDisplaySeek(Math.min(current, roomStateRef.current?.duration ?? 0));
          
          
        } else {
          setDisplaySeek(roomStateRef.current?.seek ?? 0);
        }
      }
      rafRef.current = raf(update);
    };
    rafRef.current = raf(update);

    return () => raf.cancel(rafRef.current);
  }, [roomState.playing,roomState.startedAt,roomState.seek,roomState.duration,roomState.rate,loaded]);

  useEffect(() => {
    if (currentToast || toastQueue.length === 0) return;

    const nextToast = toastQueue[0];
    setCurrentToast(nextToast);
    setToastQueue((prev) => prev.slice(1));

    const timer = setTimeout(() => setCurrentToast(null), 3000);
    return () => clearTimeout(timer);
  }, [currentToast, toastQueue]);

  const currentSong = useMemo(() => {
          if (!roomState || !files.length) return null;
         if(roomState.playlistMode==="shuffle"){
          return files[roomState.shuffledIndices[roomState.currentIndex]];
         }else{
          return files[roomState.currentIndex];
         }
      }, [roomState,files]);
  

  const value = {
    currentSong,
    roomState,setRoomState,
    playlistMode,
    isSeekingRef,
    socketRef,
    
    playerRef,
    playing,
    displaySeek,
    rate,
    isHost,
    setDisplaySeek,
    files,
    roomCode,
    setRoomCode,
    userName,
    setUserName,
    usersInRoom,
    setUsersInRoom,
    roomDetails,
    setRoomDetails,
    hostName,
    setHostName,
    toastQueue,
    setToastQueue,
    currentToast,
    setCurrentToast,
    notification,
    setNotification,
    addToast,
    loaded,
    setLoaded,
    duration,
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

