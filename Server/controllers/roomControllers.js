import Room from "../modules/roomModule.js";
import fs from "fs";
import path from "path";
import {parseFile} from 'music-metadata'
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const getRoomInfo=async(req,res)=>{
    try {
        const roomId = req.params.roomId;
        if(!roomId){
            return res.status(404).json({message:'roomId not found'})
        }
        const room = await Room.findOne({roomId});
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(201).json({message:'Room Info',roomInfo:room})
    } catch (error) {
        res.status(500).json({message:'server error when fetch room info',error:error.message})
    }
}

const createRoom = async (req, res) => {
    try {
        const { roomName, roomPassword } = req.body;
        const roomId = String(Math.floor(1000 + Math.random() * 9000));
        // Here you would typically save the room details to a database
        const newRoom = new Room({
            roomId,
            roomName,
            roomPassword,
            createdBy: req.user?.name || "Unknown",
            createdAt: new Date(),
        });
        await newRoom.save();

        const userName = req.user?.name;
        res.status(201).json({
            success: true,
            message: "Room created successfully",
            room:newRoom,
            name:userName
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomId, roomPassword } = req.body;
        const userName = req.user?.name;
        const room = await Room.findOne({ roomId }).select('+roomPassword');

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // const isMatch= await bcrypt.compare(roomPassword,room.roomPassword)

        const isMatch = (roomPassword === room.roomPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }
        res.status(201).json({
            success: true,
            message: "joined room successfully",
            room,
           name:userName
        });
    } catch (error) {
        res.status(500).json({ message: "error when joining room" });
    }
};

const addSong = async (req, res) => {
    try {
        const files = req.files;
        const roomId = req.params.roomId;

       
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const existRoom = await Room.findOne({ roomId });
        if (!existRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        
    const uploadPath = path.join("uploads", roomId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }


    const existSongs = existRoom.roomState.files.map((f) => f.fileName);

    const newSongs = [];
    const duplicates = [];

    for (const file of files) {
        
        

        if (existSongs.includes(file.originalname) ){
            duplicates.push({ fileName: file.originalname });
            fs.unlinkSync(file.path); // delete uploaded file
            continue;
          }

          let duration = 0;
          try {
            const metadata = await parseFile(file.path);
            duration = Math.round(metadata.format.duration || 0);
          } catch (err) {
            console.error("Metadata read failed:", err.message);
          }

          
          

          newSongs.push({
            fileName: file.originalname,
            savedFileName: file.filename,
            url: `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${roomId}/${file.filename}`,
           duration,
            size: file.size,
          });
        }

        if (newSongs.length > 0) {
            await Room.updateOne(
              { roomId },
              { $push: { "roomState.files": { $each: newSongs } } }
            );
          }
       
        let message = '';
        if (newSongs.length > 0 && duplicates.length > 0) {
            message = `${newSongs.length} ${newSongs.length===1?'song':'songs'} added, ${duplicates.length} ${duplicates.length===1 ? 'duplicate':'duplicate(s)'} skipped.`;
        } else if (newSongs.length > 0) {
            message = `${newSongs.length}  ${newSongs.length===1?'song':'songs'} added,`;
        } else if (duplicates.length > 0) {
            message = `${duplicates.length} ${duplicates.length===1 ? 'duplicate':'duplicate(s)'} skipped.`;
        }
        

        const updatedSongList=[...existRoom.roomState.files,...newSongs] 
        res.status(201).json({
            message,
            added: newSongs,   
            duplicates,
            audioFiles:    updatedSongList       // full updated playlist
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getSongs = async (req,res) => {
    try {
        const roomId = req.params.roomId;

        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.status(201).json({
            message: "Get Songs Successfully ",
            audioFiles: room.audios,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeSong = async (req, res) => {
    try {
        const { roomId, fileName } = req.params;

        const __filename=fileURLToPath(import.meta.url);
        const __dirname= path.dirname(__filename);
       

        const filePath = path.join(__dirname,"..","uploads", roomId, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }else {

            return res.status(404).json({ message: "File not found" });
          }    

        await Room.updateOne(
            { roomId },
            {
                $pull: { "roomState.files": { savedFileName:fileName } },
            }
        );

       

        res.json({ message: "Song Removed"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { createRoom, addSong, removeSong, joinRoom, getSongs, getRoomInfo };
