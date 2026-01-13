
import { Router } from 'express'
import {createRoom,addSong,removeSong,joinRoom,getSongs, getRoomInfo} from '../controllers/roomControllers.js'
import protect from '../middleware/authMiddleware.js';
// import uploads from '../middleware/multer'
import uploads from '../middleware/multer.js'
const router = Router();
// Route to create a new room
router.post('/create',protect, createRoom);
router.post('/join',protect, joinRoom);
router.post('/audioUpload/:roomId',uploads.array("audios"),addSong);
router.get('/audioGet/:roomId',getSongs);
router.get('/getRoomInfo/:roomId',getRoomInfo);
router.delete('/deleteSong/:roomId/:fileName',removeSong)
export default router;