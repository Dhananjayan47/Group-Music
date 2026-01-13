import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        
        const roomId=req.params.roomId
        const uploadPath= path.join('uploads',roomId);

        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath,{recursive:true});
        }
        cb(null,uploadPath)
    },
    filename:(req,file,cb)=>{
        const ext = path.extname(file.originalname);     
        const base = path.basename(file.originalname, ext);
      

      
      
      
        const uniqueName=`${base}-${Date.now()}${ext}`;
        cb(null,uniqueName);
    },
});
const uploads=multer({storage});
export default uploads;