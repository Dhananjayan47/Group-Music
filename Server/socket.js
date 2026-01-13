import Room from "./modules/roomModule.js";
import deleteRoomUploads from "./utils/deleteUploads.js";
export default function setupSocket(io) {
    io.on("connection", (socket) => {
        console.log("user connected:", socket.id);
        //join

        function shuffleArray(arr) {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
          }
          
        socket.on("join-room", async ({ roomId, userName }) => {
            try {
                socket.join(roomId);
                socket.roomId = roomId;
                socket.userName = userName;

                const room = await Room.findOne({ roomId });
                if (!room) return;
                
                let currentState = room.roomState.toObject();
    if (currentState.playing && currentState.startedAt) {
        const elapsed = (Date.now() - currentState.startedAt) / 1000;
        currentState.seek = Math.min(currentState.seek + elapsed, currentState.duration || 999);
    }
                

                const sockets = await io.in(roomId).fetchSockets();
                const users = sockets.map((s) => s.userName);
                io.to(roomId).emit("roomUsers", users);
                io.to(roomId).emit("user-joined", {
                    message: `${userName} joined the room`,
                    roomState:currentState
                });
                // console.log(userName, "joined", roomId);
            } catch (error) {
                console.error(error.message);
            }
        });

        socket.on("on-load",async ({ roomId, duration}) => {
            const room = await Room.findOne({ roomId });
  if (!room) return;
  if (socket.userName !== room.createdBy) return;

  room.roomState.duration = duration;
  room.roomState.rate=1;

  await room.save();

io.to(roomId).emit("room-state", {
    roomState: room.roomState
  });
        });
        socket.on("on-rate",async ({ roomId, value }) => {

            const room = await Room.findOne({ roomId });
            if (!room) return;
            if (socket.userName !== room.createdBy) return;

            room.roomState.rate = value;
await room.save();
io.to(roomId).emit("room-state", { roomState: room.roomState });

        });
       

        
        socket.on("seek", async ({ roomId, seek }) => {
            const room = await Room.findOne({ roomId });
            if (!room) return;
            if (socket.userName !== room.createdBy) return;
            
            const state = room.roomState;
            state.seek = seek;
            state.startedAt = state.playing ? Date.now() : null;
            room.save();
            
            io.to(roomId).emit("room-state", { roomState: state });
           console.log('semicbv');
           
            io.to(roomId).emit("sync-seek", { seek });
        });

        socket.on("on-loop", ({ roomId }) => {
            io.to(roomId).emit("sync-loop");
        });
        //add song
        socket.on("song-added", async({ roomId, msg, sender }) => {
            const room = await Room.findOne({ roomId });
            if (!room) return;
          
            io.to(roomId).emit("room-state", { roomState: room.roomState });
            io.to(roomId).emit("sync-added",{msg,sender})
        });

        //play
        socket.on("play-song", async({ roomId }) => {
            // console.log('play')
            const room = await Room.findOne({ roomId });
  if (!room) return;
  if (socket.userName !== room.createdBy) return;

            if (room.roomState.playing) return;

            room.roomState.playing=true;
            room.roomState.startedAt=Date.now();
            await room.save()
            io.to(roomId).emit("room-state",{
                roomState:room.roomState
            });
        });
        socket.on("pause-song",async ({ roomId }) => {
        
            const room = await Room.findOne({ roomId });
            if (!room) return;
            if (socket.userName !== room.createdBy) return;

  if (!room.roomState.playing) return;

  const now =Date.now();

  const elapsed = (now - room.roomState.startedAt)/1000;
          
  const currentSeek = room.roomState.seek + elapsed;

  room.roomState.seek=currentSeek;
  room.roomState.startedAt=null;
  room.roomState.playing=false;
  
  await room.save();
  
  io.to(roomId).emit("room-state",{
    roomState:room.roomState
  });
        });
        
        socket.on("next-song",async ({ roomId}) => {
            const room = await Room.findOne({ roomId });
  if (!room) return;
  if (socket.userName !== room.createdBy) return;

  const total = room.roomState.files.length;
  if (total === 0) return;

  room.roomState.currentIndex =
  (room.roomState.currentIndex + 1) % total;

room.roomState.seek = 0;
room.roomState.duration = 0;
room.roomState.startedAt =
  room.roomState.playing ? Date.now() : null;

  await room.save();

  io.to(roomId).emit("room-state", {
    roomState: room.roomState
  });
        });
        socket.on("prev-song",async ({ roomId }) => {
            const room = await Room.findOne({ roomId });
            if (!room) return;
            if (socket.userName !== room.createdBy) return;
          
            const total = room.roomState.files.length;
            if (total === 0) return;
          
            room.roomState.currentIndex =
            (room.roomState.currentIndex - 1 + total) % total;
          
          room.roomState.seek = 0;
          room.roomState.duration = 0;
          room.roomState.startedAt =
            room.roomState.playing ? Date.now() : null;
          
            await room.save();
          
            io.to(roomId).emit("room-state", {
              roomState: room.roomState
            });
        });
        socket.on("change-playlist-mode", async ({ roomId, mode }) => {
            const room = await Room.findOne({ roomId });
            if (!room) return;
            if (socket.userName !== room.createdBy) return;

            room.roomState.playlistMode=mode;

            if(mode==='shuffle'){
                const total=room.roomState.files.length;
                room.roomState.shuffledIndices=shuffleArray([...Array(total).keys()]);
            }

            await room.save();

            io.to(roomId).emit("room-state", {
              roomState: room.roomState
            });
        });

        socket.on('song-ended',async ({roomId}) => {
            const room = await Room.findOne({ roomId });
  if (!room) return;
  if (socket.userName !== room.createdBy) return;

  const state = room.roomState;
  const total = state.files.length;

  if (state.playlistMode === "loopOnce") {
    // repeat same song
  }else if(state.playlistMode==='shuffle'){
    const pos =state.shuffledIndices.indexOf(state.currentIndex);

    const nextPos=pos+1;

    if(nextPos >= state.shuffledIndices.length){
        state.shuffledIndices =
        shuffleArray([...Array(total).keys()]);
      state.currentIndex = state.shuffledIndices[0];
    }else {
        state.currentIndex = state.shuffledIndices[nextPos];
      }
  }else{
    state.currentIndex =
    (state.currentIndex + 1) % total;
}

state.seek = 0;
state.duration = 0;
state.startedAt = state.playing ? Date.now() : null;

await room.save();

io.to(roomId).emit("room-state", {
    roomState: state
  });
        })

        socket.on("remove-song", async({ change,roomId, index, fileName, removedBy }) => {
            try {
                const room = await Room.findOne({ roomId });
                if (!room) return;
                if (socket.userName !== room.createdBy) return;

                io.to(roomId).emit("room-state",{roomState:room.roomState})
                io
                    .to(roomId)
                    .emit("sync-remove", {change, removedBy, fileName, index });
                console.log(
                    `${removedBy} removed ${fileName} from room ${roomId}`
                );
            } catch (error) {
                console.log("Remove song error:", error.message);
            }
        });

        //user left
        socket.on("leave-room", async () => {
            try {
                if (!socket.roomId) return;

                const roomId = socket.roomId;
                const leftUser = socket.userName;

                
                const roomInfo = await Room.findOne({roomId});
                if (!roomInfo) return;
                const isHost = socket.userName === roomInfo?.createdBy;
                if (isHost) {
                    console.log("id room",roomId)
                    io.to(roomId).emit("room-closed", "Host left. Room closed.");
                    deleteRoomUploads(roomId);
                    await Room.deleteOne({roomId});
                    console.log("msg disconnect host");
                 
                }else{

                    socket.to(roomId).emit("user-left", {
                        message: `${leftUser} left the room`,
                    });
                    console.log("msg disconnect host after exist");
                    const remainingSockets = await io.in(roomId).fetchSockets();
                    const users =  remainingSockets
                    .filter(s => s.id !== socket.id)
                    .map(s => s.userName);
    
    
                    io.to(roomId).emit("roomUsers", users);
                }
                socket.roomId = null;
              
            } catch (error) {
                console.error(error.message);
            }
        });
        socket.on("disconnect", (reason) => {
            console.log(
              "Socket fully disconnected:",
              socket.id,
              "Reason:",
              reason

            );
          });
    });
}
